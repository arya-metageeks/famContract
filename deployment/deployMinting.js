// deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Specify the addresses for the payment token, fee recipient, and initial owner
  const paymentTokenAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum Mainnet
  const feeRecipientAddress = "0x76b2Fbf2e95d72FEb8E7F2F7De7aF41BA3c55c53"; // Fee recipient wallet address
  const initialOwnerAddress = "0x2Ba1Bf6aB49c0d86CDb12D69A777B6dF39AB79D9"; // Deployer address is the initial owner address


  // Get the contract factory for the upgradeable contract
  const FamDomainMinting = await ethers.getContractFactory("FamDomainMintingV1");

  // Deploy the proxy for the upgradeable contract with initialization
  const DomainMintingUpgradable = await upgrades.deployProxy(
    FamDomainMinting,
    [paymentTokenAddress, feeRecipientAddress, initialOwnerAddress],
    { initializer: "initialize" }
  );

  // Wait for the deployment to complete
//   await DomainMintingUpgradable.deployed();

  console.log("DomainMintingUpgradable deployed to:", DomainMintingUpgradable.target);
  const owner = await DomainMintingUpgradable.owner();
  console.log("Owner:", owner)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });