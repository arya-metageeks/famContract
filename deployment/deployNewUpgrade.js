const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f";

  console.log("Checking current implementation address...");
  const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Current Implementation Address:", currentImpl);

  console.log("Preparing new implementation...");
  const FamDomainMinting = await ethers.getContractFactory("FamDomainMintingV1");

  console.log("Starting the upgrade...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, FamDomainMinting, {
    gasLimit: 5000000,
  });
  console.log("Upgrade completed successfully!");

  const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New Implementation Address:", newImpl);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during upgrade:", error);
    process.exit(1);
  });
