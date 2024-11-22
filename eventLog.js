const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// ABI for the events we want to listen to
const eventABI = [
    "event DomainMinted(address indexed user, string domain)",
    "event ReferralCodeCreated(address indexed referrer, string referralCode)",
    "event ReferralMinted(address indexed user, string domain, address indexed referrer, uint256 fee)"
];

// Helper function to create output directory
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Helper function to save events to file
async function saveEventsToFile(events, filename) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'event-logs');
    await ensureDirectoryExists(outputDir);
    
    const outputPath = path.join(outputDir, `${filename}_${timestamp}.json`);
    await fs.writeFile(
        outputPath,
        JSON.stringify(events, null, 2),
        'utf8'
    );
    console.log(`Saved ${events.length} events to ${outputPath}`);
}

async function getAllEvents() {
    try {
        // Connect to provider
        const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_MAINNET_RPC);
        console.log('Connected to network:', await provider.getNetwork());
        
        // Contract address
        const contractAddress = process.env.CONTRACT_ADDRESS;
        console.log('Contract address:', contractAddress);
        
        // Create contract interface
        const iface = new ethers.Interface(eventABI);
        
        // Get current block
        const currentBlock = await provider.getBlockNumber();
        console.log('Current block:', currentBlock);
        
        // Fetch from genesis or last 10000 blocks
        const fromBlock = 0;
        console.log('Fetching events from block:', fromBlock);

        // Create filter for all events
        const filter = {
            address: contractAddress,
            fromBlock: fromBlock,
            toBlock: 'latest'
        };

        console.log('Fetching logs...');
        const logs = await provider.getLogs(filter);
        console.log(`Total logs found: ${logs.length}`);

        if (logs.length === 0) {
            const diagnostics = {
                timestamp: new Date().toISOString(),
                error: 'No events found',
                details: {
                    contractExists: await provider.getCode(contractAddress) !== '0x',
                    transactionCount: await provider.getTransactionCount(contractAddress),
                    network: await provider.getNetwork(),
                    contractAddress: contractAddress
                }
            };
            await saveEventsToFile([diagnostics], 'diagnostics');
            return;
        }

        // Parse DomainMinted events
        const domainMintedEvents = logs
            .filter(log => log.topics[0] === iface.getEvent("DomainMinted").topicHash)
            .map(log => {
                const parsedLog = iface.parseLog(log);
                return {
                    blockNumber: log.blockNumber,
                    user: parsedLog.args[0],
                    domain: parsedLog.args[1],
                    transactionHash: log.transactionHash,
                    timestamp: new Date().toISOString()
                };
            });
        await saveEventsToFile(domainMintedEvents, 'domain_minted');

        // Parse ReferralCodeCreated events
        const referralCodeEvents = logs
            .filter(log => log.topics[0] === iface.getEvent("ReferralCodeCreated").topicHash)
            .map(log => {
                const parsedLog = iface.parseLog(log);
                return {
                    blockNumber: log.blockNumber,
                    referrer: parsedLog.args[0],
                    referralCode: parsedLog.args[1],
                    transactionHash: log.transactionHash,
                    timestamp: new Date().toISOString()
                };
            });
        await saveEventsToFile(referralCodeEvents, 'referral_codes');

        // Parse ReferralMinted events
        const referralMintedEvents = logs
            .filter(log => log.topics[0] === iface.getEvent("ReferralMinted").topicHash)
            .map(log => {
                const parsedLog = iface.parseLog(log);
                return {
                    blockNumber: log.blockNumber,
                    user: parsedLog.args[0],
                    domain: parsedLog.args[1],
                    referrer: parsedLog.args[2],
                    fee: ethers.formatUnits(parsedLog.args[3], 6),
                    transactionHash: log.transactionHash,
                    timestamp: new Date().toISOString()
                };
            });
        await saveEventsToFile(referralMintedEvents, 'referral_minted');

        // Save summary statistics
        const summary = {
            timestamp: new Date().toISOString(),
            totalEvents: logs.length,
            domainMintedCount: domainMintedEvents.length,
            referralCodesCount: referralCodeEvents.length,
            referralMintedCount: referralMintedEvents.length,
            fromBlock: fromBlock,
            toBlock: currentBlock,
            contractAddress: contractAddress
        };
        await saveEventsToFile([summary], 'summary');

    } catch (error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        };
        await saveEventsToFile([errorLog], 'error_log');
        console.error('\nError occurred:', error.message);
        
        if (error.message.includes('network')) {
            console.log('\nPossible network connection issue. Please check:');
            console.log('1. ARBITRUM_MAINNET_RPC in .env is correct');
            console.log('2. Network is accessible');
            console.log('3. You have sufficient rate limits on your RPC endpoint');
        }
        if (error.message.includes('contract')) {
            console.log('\nPossible contract issue. Please check:');
            console.log('1. CONTRACT_ADDRESS in .env is correct');
            console.log('2. Contract is deployed on this network');
        }
    }
}

// Check if environment variables are set
if (!process.env.ARBITRUM_MAINNET_RPC || !process.env.CONTRACT_ADDRESS) {
    console.error('Missing environment variables. Please check your .env file has:');
    console.log('ARBITRUM_MAINNET_RPC=your_ARBITRUM_MAINNET_RPC');
    console.log('CONTRACT_ADDRESS=your_contract_address');
    process.exit(1);
}

getAllEvents().catch(console.error);