const { ethers } = require("hardhat");
require("dotenv").config();

const FAM_ABI = [
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
];

const ADMIN_ABI = [
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
];

async function getWallet() {
  // const provider = new ethers.JsonRpcProvider(
  //   process.env.ARBITRUM_TESTNET_RPC
  // );

  // const wallet = new ethers.Wallet(
  //   process.env.MASTER_PRIVATE_KEY_TESTNET,
  //   provider
  // );

  // return { wallet, provider };

  //Mainnet
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_MAINNET_RPC);

  const wallet = new ethers.Wallet(process.env.MASTER_PRIVATE_KEY, provider);

  return { wallet, provider };
}

async function transferOwnership(
  proxyAddress,
  adminAddress,
  newOwnerAddress,
  wallet
) {
  try {
    // Get contract instances
    const contractProxy = new ethers.Contract(proxyAddress, FAM_ABI, wallet);

    const contractAdmin = new ethers.Contract(adminAddress, ADMIN_ABI, wallet);

    // Get current owner
    const currentProxyOwner = await contract.owner();
    console.log("Current owner:", currentOwner);

    const currentAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log("Current owner:", currentAdmin);

    // Verify wallet has permission
    if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error("Wallet is not the current owner");
    }

    // Transfer ownership
    const tx = await contract.transferOwnership(newOwnerAddress, {
      gasLimit: 100000, // Explicit gas limit
    });

    console.log("Transferring ownership...");
    console.log("Transaction hash:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait(2); // Wait for 2 confirmations

    if (receipt.status === 0) {
      throw new Error("Transaction failed");
    }

    // Verify new owner
    const newOwner = await contract.owner();
    console.log("New owner:", newOwner);

    if (newOwner.toLowerCase() !== newOwnerAddress.toLowerCase()) {
      throw new Error("Ownership transfer failed verification");
    }

    return true;
  } catch (error) {
    console.error("Error in ownership transfer:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const PROXY_ADDRESS = "0xDbc0BAa4ecb73FD6f7EE0eA553fb3CE92402E30B";
    const ADMIN_ADDRESS = "0x02B99eac3A0B87Bf36A8d421f4A8A6546430aD55";
    const NEW_OWNER_ADDRESS = "0xad57aAcad13d86Daa8aD55f0e18B1b62377c0496";

    // Input validation
    // if (!ethers.isAddress(PROXY_ADDRESS) || !ethers.isAddress(NEW_OWNER_ADDRESS)) {
    //   throw new Error("Invalid address format");
    // }

    if (
      !ethers.isAddress(ADMIN_ADDRESS) ||
      !ethers.isAddress(NEW_OWNER_ADDRESS)
    ) {
      throw new Error("Invalid address format");
    }

    const { wallet } = await getWallet();
    console.log(`Master Wallet Address: ${wallet.address}`);

    await transferOwnership(ADMIN_ADDRESS, NEW_OWNER_ADDRESS, wallet);

    console.log("Ownership transfer completed successfully");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Add support for direct execution and testing
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  transferOwnership,
  getWallet,
};
