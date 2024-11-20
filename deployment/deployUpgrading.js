// Domain minting upgrade with existing proxy address
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Specify the proxy address of the already deployed contract
  const proxyAddress = "0xDa267f9cEebCc930A5C59dE40B15B0a20B082c1A"; 
  // const proxyAddress = "0x676b4a82C1e078D3E24F61c7B3aeAd7e6CAbC8EB"; 

  // 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  // Get the contract factory for the new implementation
  const FamDomainMinting = await ethers.getContractFactory("FamDomainMintingV1");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, FamDomainMinting);


  console.log("DomainMintingUpgradable has been upgraded to:", upgraded.target);
  console.log("New Implementation Address:", await upgrades.erc1967.getImplementationAddress(proxyAddress));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });