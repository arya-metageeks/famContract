const { ethers } = require("hardhat");

async function grantUpgraderRole() {
  // Get the current signer (typically the deployer/owner)
  const [deployer] = await ethers.getSigners();

  // The proxy address of your contract
  const proxyAddress = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f";

  // Create a contract instance
  const contract = await ethers.getContractAt(
    "FamDomainMintingV1", 
    proxyAddress
  );

  try {
    // In ethers v6, you might need to define the role hash differently
    // Option 1: Try to get it from the contract
    const UPGRADER_ROLE = await contract.UPGRADER_ROLE();

    // Option 2: If the above fails, you can manually create the role hash
    // const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));

    // The address you want to grant the role to 
    const addressToGrant = deployer.address;

    // Check if the role is already granted
    const hasRole = await contract.hasRole(UPGRADER_ROLE, addressToGrant);
    
    if (hasRole) {
      console.log(`Address ${addressToGrant} already has UPGRADER_ROLE`);
      return;
    }

    // Grant the role
    const tx = await contract.grantRole(UPGRADER_ROLE, addressToGrant);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log(`UPGRADER_ROLE granted to: ${addressToGrant}`);
    console.log(`Transaction hash: ${receipt.hash}`);

    // Verify the role was granted
    const isNowGranted = await contract.hasRole(UPGRADER_ROLE, addressToGrant);
    console.log(`Role successfully granted: ${isNowGranted}`);

  } catch (error) {
    console.error("Error granting role:", error);
    
    // Detailed error logging
    if (error.code === 'ACTION_REJECTED') {
      console.log("Transaction was rejected by the user");
    } else if (error.message.includes("denied")) {
      console.log("Transaction was denied");
    } else if (error.message.includes("insufficient funds")) {
      console.log("Insufficient funds for gas");
    } else {
      console.log("Detailed error:", error.message);
    }
  }
}

grantUpgraderRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });