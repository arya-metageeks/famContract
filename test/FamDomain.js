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
      it("Should allow free minting for whitelisted users", async () => {
        txn = await domainContract.addFreeMintWhitelist(user1.address);
        await txn.wait();

        txn = await domainContract.connect(user1).freeMintDomain("example.com");
        await txn.wait();

        const domainOwner = await domainContract.getDomainOwner("example.com");
        expect(domainOwner).to.equal(user1.address);
      });

      it("Should emit DomainMinted event", async () => {
        txn = await domainContract.addFreeMintWhitelist(user1.address);
        await txn.wait();

        await expect(domainContract.connect(user1).freeMintDomain("example.com"))
          .to.emit(domainContract, "DomainMinted")
          .withArgs(user1.address, "example.com");
      });
    });

    describe("Failure cases", () => {
      it("Should revert for non-whitelisted users", async () => {
        await expect(domainContract.connect(user2).freeMintDomain("example.com"))
          .to.be.revertedWith("You are not whitelisted for free mint");
      });

      it("Should revert if domain already exists", async () => {
        txn = await domainContract.addFreeMintWhitelist(user1.address);
        await txn.wait();

        txn = await domainContract.connect(user1).freeMintDomain("example.com");
        await txn.wait();

        await expect(domainContract.connect(user1).freeMintDomain("example.com"))
          .to.be.revertedWith("Domain already exists");
      });

      it("Should revert if user has already minted a domain", async () => {
        txn = await domainContract.addFreeMintWhitelist(user1.address);
        await txn.wait();

        txn = await domainContract.connect(user1).freeMintDomain("example.com");
        await txn.wait();

        await expect(domainContract.connect(user1).freeMintDomain("another.com"))
          .to.be.revertedWith("You have already minted a domain");
      });
    });
  });

  describe("Discount Minting", () => {
    describe("Successful cases", () => {
      it("Should allow discount minting for whitelisted users", async () => {
        txn = await domainContract.addDiscountMintWhitelist(user1.address);
        await txn.wait();

        // Calculate discount fee - make sure this matches your contract's expected amount
        const mintAmount = ethers.parseEther("0.001942532129481422");
        const discountPrice = mintAmount / BigInt(2);

        // Call discount mint function with the correct value parameter
        const mintTxn = await domainContract.connect(user1).discountMintDomain(
          "example.net",
          // mintAmount,
          // { value: discountPrice }  
          // Pass value as an object with the amount
        );
        await mintTxn.wait();

        const domainOwner = await domainContract.getDomainOwner("example.net");
        expect(domainOwner).to.equal(user1.address);
      });

      it("Should emit DomainMinted event", async () => {
        txn = await domainContract.addDiscountMintWhitelist(user1.address);
        await txn.wait();

        const mintAmount = ethers.parseEther("0.001942532129481422");
        const discountPrice = mintAmount / BigInt(2);

        await expect(domainContract.connect(user1).discountMintDomain("example.net"))
        // await expect(domainContract.connect(user1).discountMintDomain("example.net", mintAmount, { value: discountPrice }))
          .to.emit(domainContract, "DomainMinted")
          .withArgs(user1.address, "example.net");
      });
    });

    describe("Failure cases", () => {
      it("Should reject non-whitelisted users", async () => {
        const mintAmount = ethers.parseEther("0.001942532129481422");
        const discountPrice = mintAmount / BigInt(2);

        await expect(
          domainContract.connect(user2).discountMintDomain(
            "example.net",
            // mintAmount,
            // { value: discountPrice }
          )
        ).to.be.revertedWith("You are not whitelisted for discount mint");
      });

      // it("Should reject if insufficient ETH sent", async () => {
      //   await domainContract.addDiscountMintWhitelist(user1.address);
      //   const mintAmount = ethers.parseEther("0.001942532129481422");
      //   const insufficientAmount = (mintAmount / BigInt(2)) - BigInt(1000);

      //   await expect(
      //     domainContract.connect(user1).discountMintDomain(
      //       "example.net",
      //       // mintAmount,
      //       // { value: insufficientAmount }
      //     )
      //   ).to.be.revertedWith("Insufficient ETH sent");
      // });

      it("Should reject duplicate domain minting", async () => {
        await domainContract.addDiscountMintWhitelist(user1.address);
        await domainContract.addDiscountMintWhitelist(user2.address);
        const mintAmount = ethers.parseEther("0.001942532129481422");
        const discountPrice = mintAmount / BigInt(2);

        // First mint
        await domainContract.connect(user1).discountMintDomain(
          "example.net",
          // mintAmount,
          // { value: discountPrice }
        );

        // Attempt duplicate mint
        await expect(
          domainContract.connect(user2).discountMintDomain(
            "example.net",
            // mintAmount,
            // { value: discountPrice }
          )
        ).to.be.revertedWith("Domain already exists");
      });

      it("Should reject multiple mints from same user", async () => {
        await domainContract.addDiscountMintWhitelist(user1.address);
        const mintAmount = ethers.parseEther("0.001942532129481422");
        const discountPrice = mintAmount / BigInt(2);

        // First mint
        await domainContract.connect(user1).discountMintDomain(
          "example1.net",
          // mintAmount,
          // { value: discountPrice }
        );

        // Attempt second mint
        await expect(
          domainContract.connect(user1).discountMintDomain(
            "example2.net",
            // mintAmount,
            // { value: discountPrice }
          )
        ).to.be.revertedWith("You have already minted a domain");
      });
    });
  });

  describe("Minting with Referral", () => {
    let txn

    describe("Successful cases", () => {
      it("Should allow minting with valid referral code", async () => {
        txn = await domainContract.addFreeMintWhitelist(user2.address);
        await txn.wait();

        txn = await domainContract.connect(user2).freeMintDomain("example3.com");
        await txn.wait();

        let hasMinted = await domainContract.hasMintedDomain(user3.address);
        console.log("HasMinted: ", hasMinted);

        txn = await domainContract.connect(user2).createReferralCode("REF123");
        await txn.wait();

        // Calculate discount fee - make sure this matches your contract's expected amount
        const mintAmount = ethers.parseEther("0.001942532129481422");

        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123",
          // mintAmount,
          // { value: mintAmount }
        );

        await mintTxn.wait();

        const domainOwner = await domainContract.getDomainOwner("example.io");
        expect(domainOwner).to.equal(user3.address);

      });

      it("Should emit ReferralMinted event", async () => {

        txn = await domainContract.addFreeMintWhitelist(user2.address);
        await txn.wait();

        txn = await domainContract.connect(user2).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(user2).createReferralCode("REF123");
        await txn.wait();

        const mintAmount = ethers.parseEther("0.001942532129481422");


        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
        // await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123",mintAmount,{ value: mintAmount }))
          .to.emit(domainContract, "ReferralMinted")
          .withArgs(user3.address, "example.io", user2.address);
          // .withArgs(user3.address, "example.io", user2.address, mintAmount/BigInt(2));
      });
    });

    describe("Failure cases", () => {
      let txn
      it("Should revert for invalid referral code", async () => {
        const mintAmount = ethers.parseEther("0.001942532129481422");

        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
        // await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123",mintAmount,{ value: mintAmount }))
          .to.be.revertedWith("Invalid referral code");
      });

      it("Should revert if domain already exists", async () => {
        txn = await domainContract.addFreeMintWhitelist(user2.address);
        await txn.wait();

        txn = await domainContract.connect(user2).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(user2).createReferralCode("REF123");
        await txn.wait();

        const mintAmount = ethers.parseEther("0.001942532129481422");


        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123",
          // mintAmount,
          // { value: mintAmount }
        );

        await mintTxn.wait();
        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))
        // await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123",mintAmount,{ value: mintAmount }))
          .to.be.revertedWith("Domain already exists");
      });

      it("Should revert if user has already minted a domain", async () => {

        txn = await domainContract.addFreeMintWhitelist(user2.address);
        await txn.wait();

        txn = await domainContract.connect(user2).freeMintDomain("example3.com");
        await txn.wait();

        txn = await domainContract.connect(user2).createReferralCode("REF123");
        await txn.wait();

        const mintAmount = ethers.parseEther("0.001942532129481422");

        const mintTxn = await domainContract.connect(user3).mintDomainWithReferral(
          "example.io", 
          "REF123",
          // mintAmount,
          // { value: mintAmount }
        );

        await mintTxn.wait();
        await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123"))

        // await expect(domainContract.connect(user3).mintDomainWithReferral("example.io", "REF123",mintAmount,{ value: mintAmount }))
          .to.be.revertedWith("Domain already exists");
      });
    });
  });

  describe("Creating Referral Codes", () => {
    let txn

    it("Should allow creating referral codes after minting", async () => {
      txn = await domainContract.addFreeMintWhitelist(user1.address);
      await txn.wait();

      txn = await domainContract.connect(user1).freeMintDomain("example.com");
      await txn.wait();

      txn = await domainContract.connect(user1).createReferralCode("REF123");
      await txn.wait();

      expect(await domainContract.referralOwners("REF123")).to.equal(user1.address);
    });

    it("Should revert for users who haven't minted a domain", async () => {
      await expect(domainContract.connect(user2).createReferralCode("REF456"))
        .to.be.revertedWith("You must mint a domain first");
    });
  });

  describe("Getting Domain Owner", () => {
    let txn
    it("Should return the correct owner for a minted domain", async () => {
      txn = await domainContract.addFreeMintWhitelist(user1.address);
      await txn.wait();

      txn = await domainContract.connect(user1).freeMintDomain("example.com");
      await txn.wait();

      expect(await domainContract.getDomainOwner("example.com")).to.equal(user1.address);
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
