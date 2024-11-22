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
    // Log contract interface to understand available methods
    console.log("Contract interface:");
    console.log(Object.keys(contract.interface.functions));

    // Log available methods on the contract
    console.log("\nAvailable methods:");
    for (let method in contract) {
      if (typeof contract[method] === 'function') {
        console.log(method);
      }
    }

    // Manually create the role hash
    const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));

    // The address you want to grant the role to 
    const addressToGrant = deployer.address;

    // Check contract's owner or admin methods
    const owner = await contract.owner ? await contract.owner() : "No owner method found";
    console.log("\nContract Owner:", owner);
    console.log("Deployer Address:", deployer.address);

    // Attempt to grant role using a more generic method
    const tx = await contract.grantRole(UPGRADER_ROLE, addressToGrant);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log(`Role attempted to be granted to: ${addressToGrant}`);
    console.log(`Transaction hash: ${receipt.hash}`);

  } catch (error) {
    console.error("Error in role granting process:", error);
    
    // More detailed error logging
    console.log("\nFull error details:", error);
    console.log("Error name:", error.name);
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
  }
}

grantUpgraderRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });