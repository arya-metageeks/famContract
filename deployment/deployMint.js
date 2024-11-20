const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Starting deployment process...");

  // Specify the addresses
  const paymentTokenAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum
  const feeRecipientAddress = "0x76b2Fbf2e95d72FEb8E7F2F7De7aF41BA3c55c53";
  const initialOwnerAddress = "0x2Ba1Bf6aB49c0d86CDb12D69A777B6dF39AB79D9";

  // Get the contract factory
  const FamDomainMinting = await ethers.getContractFactory("FamDomainMintingV1");
  console.log("Contract factory created");

  // Deploy with explicit initialization
  console.log("Deploying proxy with initialization parameters...");
  const proxy = await upgrades.deployProxy(
    FamDomainMinting,
    [paymentTokenAddress, feeRecipientAddress, initialOwnerAddress],
    {
      initializer: 'initialize',
      kind: 'uups', // Specify the proxy kind
      unsafeAllow: ['constructor'], // Only if needed
      timeout: 0, // Disable timeout
      pollingInterval: 5000, // Check every 5 seconds
    }
  );

  // Wait for deployment with more blocks
  console.log("Waiting for deployment confirmation...");
  await proxy.waitForDeployment();
  
  // Verify the deployment
  const proxyAddress = await proxy.getAddress();
  console.log("Proxy deployed to:", proxyAddress);

  // Verify initialization
  try {
    console.log("\nVerifying initialization...");
    const owner = await proxy.owner();
    const paymentToken = await proxy.paymentToken();
    const feeRecipient = await proxy.feeRecipient();

    console.log("Owner:", owner);
    console.log("Payment Token:", paymentToken);
    console.log("Fee Recipient:", feeRecipient);

    if (owner !== initialOwnerAddress) {
      console.error("WARNING: Owner not set correctly!");
    }
    if (paymentToken !== paymentTokenAddress) {
      console.error("WARNING: Payment token not set correctly!");
    }
    if (feeRecipient !== feeRecipientAddress) {
      console.error("WARNING: Fee recipient not set correctly!");
    }
  } catch (error) {
    console.error("Error verifying initialization:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });