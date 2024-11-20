require('dotenv').config();
const { ethers } = require('ethers');

const FAM_ABI = require('./src/abis/fam_domain_minting.json')

// Load environment variables
const ARBITRUM_TESTNET_RPC = process.env.ARBITRUM_TESTNET_RPC;
const ARBITRUM_MAINNET_RPC = process.env.ARBITRUM_MAINNET_RPC;
const MASTER_PRIVATE_KEY = process.env.MASTER_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);
const providerMain = new ethers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);

const masterWallet = new ethers.Wallet(MASTER_PRIVATE_KEY, provider);
const masterWalletMain = new ethers.Wallet(MASTER_PRIVATE_KEY, providerMain);

console.log(`Master Wallet Address: ${masterWallet.address}`);

const FAM_DOMAIN_MINTING_V1 = '0xDa267f9cEebCc930A5C59dE40B15B0a20B082c1A';
const famDomainMintingV1 = new ethers.Contract(FAM_DOMAIN_MINTING_V1, FAM_ABI, masterWallet);


const FAM_MAIN = "0x676b4a82C1e078D3E24F61c7B3aeAd7e6CAbC8EB"
const famMainV1 = new ethers.Contract(FAM_MAIN, FAM_ABI, masterWallet);


const localBlockchain = async () => {
    let contractAddress = await famDomainMintingV1.getAddress();
    console.log("Contract Address: ", contractAddress)

    const currrentOwner = await famDomainMintingV1.owner();
    console.log("Current owner:", currrentOwner);

    const currrentOwnerMain = await famMainV1.owner();
    console.log("Current owner:", currrentOwnerMain);


    let newOwnerAddress = "0xad57aAcad13d86Daa8aD55f0e18B1b62377c0496";
//

    const newOwner = await famDomainMintingV1.owner();
    console.log("NewOwner:", newOwner);

    // const implementationAddress = await proxy.getImplementation();
    // console.log("Implementation Address:", implementationAddress);

}



localBlockchain();