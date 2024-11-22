// Domain minting upgrade with existing proxy address
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Specify the proxy address of the already deployed contract
  // const proxyAddress = "0xDbc0BAa4ecb73FD6f7EE0eA553fb3CE92402E30B"; 
  // const proxyAddress = "0x3457bc1902D20457E3d22816f467035d68E130B8"; 
  // const proxyAddress = "0x43C5F84873A85dC45D10943DA572F931778B26E1"; 
  const proxyAddress = "0x74410961dc2007425e7ab96b5c022cc2bc4ae53f"; 
  // 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

  
  // DomainMintingUpgradable deployed to: 0x3457bc1902D20457E3d22816f467035d68E130B8
  // Owner: 0x8FCAf20cC45CBD33F48389A0917011aCa4345393
  
  // Get the contract factory for the new implementation
  // const FamDomainMinting = await ethers.getContractFactory("FamDomainMintingV1");
  // const proxy = await upgrades.forceImport(proxyAddress, FamDomainMinting);

  // const upgraded = await upgrades.upgradeProxy(proxyAddress, FamDomainMinting);

  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  console.log("Admin (ProxyAdmin) Address:", adminAddress);
  
  // console.log("DomainMintingUpgradable has been upgraded to:", upgraded.target);
  console.log("New Implementation Address:", await upgrades.erc1967.getImplementationAddress(proxyAddress));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });