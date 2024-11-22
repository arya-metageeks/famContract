const { ethers } = require('ethers');
require('dotenv').config();


const ARBITRUM_TESTNET_RPC = process.env.ARBITRUM_TESTNET_RPC;
const ARBITRUM_MAINNET_RPC = process.env.ARBITRUM_MAINNET_RPC;
const MASTER_PRIVATE_KEY = process.env.MASTER_PRIVATE_KEY;

// const provider = new ethers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);
const providerMain = new ethers.JsonRpcProvider(ARBITRUM_MAINNET_RPC);

// Proxy contract ABI with owner() method
const proxyABI = [
  "function owner() public view returns (address)"
];

const proxyAddress = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f";

async function fetchOwner() {
    const proxyContract = new ethers.Contract(proxyAddress, proxyABI, providerMain);

    try {
        const ownerAddress = await proxyContract.owner();
        console.log("Owner Address:", ownerAddress);
    } catch (error) {
        console.error("Error fetching owner:", error);
    }
}

fetchOwner();