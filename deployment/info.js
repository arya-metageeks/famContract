// Domain minting upgrade with existing proxy address
const { ethers, upgrades } = require("hardhat");

async function main() {

  const proxyAddress = "0x3457bc1902D20457E3d22816f467035d68E130B8"; 

  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  console.log("Admin (ProxyAdmin) Address:", adminAddress);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });