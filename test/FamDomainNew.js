const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FamDomainMintingV1", () => {
  let domainContract, domainContractAddress;
  let owner;
  let user1;
  let user2;
  let user3;
  let txn;

  beforeEach(async () => {
    [owner, user1, user2, user3, feeRecipient] = await ethers.getSigners();

    const DomainContract = await ethers.getContractFactory("FamDomainMintingV1");
    domainContract = await DomainContract.deploy();

    const paymentToken = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
    await domainContract.initialize(paymentToken,feeRecipient.address, owner.address);

    domainContractAddress = await domainContract.getAddress();
    console.log(`DomainContract Address: ${domainContractAddress}`);
  });

  describe("Initialization", () => {
    it("Should set the right owner", async () => {
      expect(await domainContract.owner()).to.equal(owner.address);
    });

    it("Should set the fee recipient correctly", async () => {
      expect(await domainContract.feeRecipient()).to.equal(feeRecipient.address);
    });
  });

  describe("Free Minting", () => {
    describe("Successful cases", () => {
      it("Should allow free minting for Owner users", async () => {

        txn = await domainContract.connect(owner).freeMintDomain("example.com");
        await txn.wait();

        const currentMintCount = await domainContract.mintCount();
        expect(currentMintCount).to.equal(1);
        // console.log("CNT:", currentMintCount)

        const domainOwner = await domainContract.getDomainOwner("example.com");
        expect(domainOwner).to.equal(owner.address);
      });

      it("Should emit DomainMinted event", async () => {
        await expect(domainContract.connect(owner).freeMintDomain("example.com"))
          .to.emit(domainContract, "DomainMinted")
          .withArgs(owner.address, "example.com");
      });
    });

    describe("Failure cases", () => {
      it("Should revert for non-whitelisted users", async () => {
        await expect(domainContract.connect(user2).freeMintDomain("example.com"))
          .to.be.revertedWithCustomError;
      });

      it("Should revert if domain already exists", async () => {
        txn = await domainContract.connect(owner).freeMintDomain("example.com");
        await txn.wait();

        await expect(domainContract.connect(owner).freeMintDomain("example.com"))
          .to.be.revertedWith("Domain already exists");
      });
    });
  });

  describe("Minting with Referral", () => {
    let txn

    describe("Successful cases", () => {
      it("Should allow minting with valid referral code", async () => {
        txn = await domainContract.connect(owner).freeMintDomain("example3.com");
        await txn.wait();
        
        txn = await domainContract.connect(owner).freeMintDomain("example4.com");
        await txn.wait();


        const currentMintCount = await domainContract.mintCount();
        expect(currentMintCount).to.equal(2);
        
        let hasMinted = await domainContract.hasMintedDomain(owner.address);
        console.log("HasMinted: ", hasMinted);

        txn = await domainContract.connect(owner).createReferralCode("REF123");
        await txn.wait();

        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123"
        );

        await mintTxn.wait();

        console.log("Owner Add:", owner.address)
        const mintRefCount = await domainContract.getReferralDetails("REF123")
        console.log("Mint Count:", mintRefCount);

        const domainOwner = await domainContract.getDomainOwner("example.io");
        expect(domainOwner).to.equal(user3.address);

      });

      it("Should emit ReferralMinted event", async () => {

        txn = await domainContract.connect(owner).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(owner).createReferralCode("REF123");
        await txn.wait();

        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
          .to.emit(domainContract, "ReferralMinted")
          .withArgs(user3.address, "example.io", owner.address,"REF123");
      });
    });

    describe("Failure cases", () => {
      let txn
      it("Should revert for invalid referral code", async () => {

        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
          .to.be.revertedWith("Invalid referral code");
      });

      it("Should revert if domain already exists", async () => {

        txn = await domainContract.connect(owner).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(owner).createReferralCode("REF123");
        await txn.wait();

        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123"
        );

        await mintTxn.wait();
        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
          .to.be.revertedWith("Domain already exists");
      });

      it("Should revert if user has already minted a domain", async () => {

        txn = await domainContract.connect(owner).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(owner).createReferralCode("REF123");
        await txn.wait();

        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123"
        );

        await mintTxn.wait();
        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
          .to.be.revertedWith("Domain already exists");
      });
    });
  });

  describe("Creating Referral Codes", () => {
    let txn

    it("Should allow creating referral codes after minting", async () => {

      txn = await domainContract.connect(owner).freeMintDomain("example.com");
      await txn.wait();

      txn = await domainContract.connect(owner).createReferralCode("REF123");
      await txn.wait();

      txn = await domainContract.connect(user1).mintDomainWithReferral("Domain.com","REF123");
      await txn.wait();

      txn = await domainContract.connect(user1).createReferralCode("REF3");
      await txn.wait();

      txn = await domainContract.connect(user2).mintDomainWithReferral("Domain001.com","REF123");
      await txn.wait();

      expect(await domainContract.referralOwners("REF123")).to.equal(owner.address);
    });

    it("Should revert for users who haven't minted a domain", async () => {
      await expect(domainContract.connect(user2).createReferralCode("REF456"))
        .to.be.revertedWith("You must mint a domain first");
    });
  });

  describe("Getting Domain Owner", () => {
    let txn
    it("Should return the correct owner for a minted domain", async () => {
      txn = await domainContract.connect(owner).freeMintDomain("example.com");
      await txn.wait();

      expect(await domainContract.getDomainOwner("example.com")).to.equal(owner.address);
    });

    it("Should return address(0) for unminted domains", async () => {
      expect(await domainContract.getDomainOwner("unminted.com")).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Updating Fee Recipient", () => {
    it("Should update the fee recipient", async () => {
      const newRecipient = ethers.Wallet.createRandom();
      txn = await domainContract.updateFeeRecipient(newRecipient.address);
      await txn.wait();

      expect(await domainContract.feeRecipient()).to.equal(newRecipient.address);
    });

    it("Should only allow the owner to update the fee recipient", async () => {
      const newRecipient = ethers.Wallet.createRandom();
      await expect(domainContract.connect(user1).updateFeeRecipient(newRecipient.address))
        .to.be.revertedWithCustomError;
    });
  });
});
