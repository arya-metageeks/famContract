require('dotenv').config();
const { ethers } = require('ethers');

const FAM_ABI = require('./src/abis/testNet_abi.json')

const proxyABI = [
    "function implementation() public view returns (address)",
    "function admin() public view returns (address)",
    "function owner() public view returns (address)"
  ];

// Load environment variables
const ARBITRUM_TESTNET_RPC = process.env.ARBITRUM_TESTNET_RPC;
const ARBITRUM_MAINNET_RPC = process.env.ARBITRUM_MAINNET_RPC;
const MASTER_PRIVATE_KEY = process.env.MASTER_PRIVATE_KEY;
const MASTER_PRIVATE_KEY_TESTNET = process.env.MASTER_PRIVATE_KEY_TESTNET;

const provider = new ethers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);
const providerMain = new ethers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);

const masterWalletTestnet = new ethers.Wallet(MASTER_PRIVATE_KEY_TESTNET, provider);
const masterWalletMain = new ethers.Wallet(MASTER_PRIVATE_KEY, providerMain);

console.log(`Master Wallet Address: ${masterWalletTestnet.address}`);

// const FAM_DOMAIN_MINTING_V1 = '0xDbc0BAa4ecb73FD6f7EE0eA553fb3CE92402E30B';
const FAM_DOMAIN_MINTING_V1 = '0xDbc0BAa4ecb73FD6f7EE0eA553fb3CE92402E30B';


const famDomainMintingV1 = new ethers.Contract(FAM_DOMAIN_MINTING_V1, FAM_ABI, masterWalletTestnet);


// const FAM_MAIN = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f"
// const FAM_MAIN = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f"

// const famMainV1 = new ethers.Contract(FAM_MAIN, proxyABI, masterWallet);


const localBlockchain = async () => {
    try {
        let contractAddress = await famDomainMintingV1.getAddress();
        console.log("Contract Address: ", contractAddress)

        const currentOwner = await famDomainMintingV1.owner();
        console.log("Current owner:", currentOwner);


        // Add error handling for the main contract
        // try {
        //     // Verify the method exists in your ABI first
        //     if (typeof famMainV1.owner === 'function') {
        //         const currentOwnerMain = await famMainV1.owner();
        //         console.log("Main Contract owner:", currentOwnerMain);
        //     } else {
        //         console.log("owner() method not found in main contract ABI");
        //     }
        // } catch (mainContractError) {
        //     console.error("Error with main contract:", mainContractError);
        // }
    } catch (error) {
        console.error("Error in localBlockchain:", error);
    }
}

const freeMintDomain = async() =>{

    let txn = await famDomainMintingV1.connect(masterWalletTestnet).freeMintDomain("arya.fam")
    await txn.wait();

    console.log("txn submitted....")

    let domainOwner = await famDomainMintingV1.getDomainOwner("arya.fam");
    console.log(`Domain Owner: ${domainOwner}`)
}


const createReferralCode = async() =>{

    let txn = await famDomainMintingV1.connect(masterWalletTestnet).createReferralCode("arya#001")
    await txn.wait();

    console.log("txn submitted....")

    let mintCount = await famDomainMintingV1.mintCount();
    console.log(`Mint Count: ${mintCount}`)
}
// localBlockchain(); 
// freeMintDomain();

createReferralCode();