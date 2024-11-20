const ethers = require('ethers');

// Contract ABI - Include only the functions we want to test
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function paymentToken() view returns (address)",
    "function feeRecipient() view returns (address)",
    "function DOMAIN_MINT_FEE() view returns (uint256)"
];

// Arbitrum mainnet configuration
const ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc";
const CONTRACT_ADDRESS = "0x1d6dde1d85eBF973Df109eb0E52a5A348A3Ed528";

async function verifyDeployment() {
    try {
        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
        console.log("Connected to network:", await provider.getNetwork());

        // First, let's check if there's actually contract code at this address
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("\nContract code exists:", code !== "0x");
        
        if (code === "0x") {
            console.error("No contract code found at the specified address!");
            return;
        }

        // Initialize contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Basic contract verification
        console.log("\nAttempting to read contract state...");
        
        try {
            const owner = await contract.owner();
            console.log("Owner:", owner);
        } catch (error) {
            console.log("Failed to read owner:", error.message);
        }

        try {
            const paymentToken = await contract.paymentToken();
            console.log("Payment Token:", paymentToken);
        } catch (error) {
            console.log("Failed to read payment token:", error.message);
        }

        try {
            const feeRecipient = await contract.feeRecipient();
            console.log("Fee Recipient:", feeRecipient);
        } catch (error) {
            console.log("Failed to read fee recipient:", error.message);
        }

        // Check contract storage directly
        console.log("\nChecking contract storage slots...");
        
        // Owner slot for OpenZeppelin Ownable (implementation may vary)
        const ownerSlot = "0x8da5cb5b";
        const storageValue = await provider.getStorage(CONTRACT_ADDRESS, 0);
        console.log("Raw storage slot 0:", storageValue);

    } catch (error) {
        console.error("Verification failed:", error);
    }
}

// Check proxy implementation using low-level storage reads
async function checkProxyImplementation() {
    try {
        const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
        
        // ERC-1967 implementation slot
        const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        
        const implementationSlot = await provider.getStorage(CONTRACT_ADDRESS, IMPLEMENTATION_SLOT);
        console.log("\nImplementation slot value:", implementationSlot);
        
        if (implementationSlot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
            // Convert the slot value to an address
            const implementationAddress = "0x" + implementationSlot.slice(-40);
            console.log("Implementation address:", implementationAddress);
            
            // Check if there's code at the implementation address
            const implementationCode = await provider.getCode(implementationAddress);
            console.log("Implementation has code:", implementationCode !== "0x");
        } else {
            console.log("No implementation found - this might not be a proxy contract");
        }
    } catch (error) {
        console.error("Error checking implementation:", error);
    }
}

async function main() {
    console.log("Starting contract verification...\n");
    await verifyDeployment();
    await checkProxyImplementation();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });