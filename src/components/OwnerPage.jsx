import React, { useState } from "react";
import { ethers } from "ethers"; // Import ethers.js

const OwnerPage = ({ famDomainMintingV1Contract, provider }) => {
  
  const [batchFreeMintWL, setBatchFreeMintWL] = useState([]);
  const [batchDiscountMintWL, setBatchDiscountMintWL] = useState([]);
  const [freeMintWL, setFreeMintWL] = useState(null);
  const [discountMintWL, setDiscountMintWL] = useState(null);
  const [removeFreeMintWL, setRemoveFreeMintWL] = useState(null);
  const [removeDiscountMintWL, setRemoveDiscountMintWL] = useState(null);
  const [feeRecipient, setFeeRecipient] = useState("");

  const handleBatchFreeMint = async (e) => {
    e.preventDefault();
    await batchAddFreeMintWhitelist(batchFreeMintWL);
  };

  const handleFreeMint = async (e) => {
    e.preventDefault();
    await addFreeMintWhitelist(freeMintWL);
  };

  const handleRemoveFreeMint = async (e) => {
    e.preventDefault();
    await removeFreeMintWhitelist(removeFreeMintWL);
  };

  const handleBatchDiscountMint = async (e) => {
    e.preventDefault();
    await batchAddDiscountMintWhitelist(batchDiscountMintWL);
  };

  const handleDiscountMint = async (e) => {
    e.preventDefault();
    await addDiscountMintWhitelist(discountMintWL);
  };

  const handleRemoveDiscountMint = async (e) => {
    e.preventDefault();
    await removeDiscountMintWhitelist(batchFreeMintWL);
  };

  const handleFeeRecipient = async (e) => {
    e.preventDefault();
    await updateFeeRecipient(feeRecipient);
  };

  const batchAddFreeMintWhitelist = async(batchFreeMintWL) =>{
    console.log("batchFreeMintWL: ",batchFreeMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).batchAddFreeMintWhitelist(batchFreeMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const addFreeMintWhitelist = async(freeMintWL) =>{
    console.log("freeMintWL: ",freeMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).addFreeMintWhitelist(freeMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const removeFreeMintWhitelist = async(removeFreeMintWL) =>{
    console.log("removeFreeMintWL: ",removeFreeMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).removeFreeMintWhitelist(removeFreeMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const batchAddDiscountMintWhitelist = async(batchDiscountMintWL) =>{
    console.log("batchDiscountMintWL: ",batchDiscountMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).batchAddDiscountMintWhitelist(batchDiscountMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const addDiscountMintWhitelist = async(discountMintWL) =>{
    console.log("discountMintWL: ",discountMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).addDiscountMintWhitelist(discountMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const removeDiscountMintWhitelist = async(removeDiscountMintWL) =>{
    console.log("removeDiscountMintWL: ",removeDiscountMintWL);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).removeDiscountMintWhitelist(removeDiscountMintWL);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const updateFeeRecipient = async(feeRecipient) =>{
    console.log("feeRecipient: ",feeRecipient);

    try {
        const signer = await provider.getSigner();
        const txn = await famDomainMintingV1Contract.connect(signer).updateFeeRecipient(feeRecipient);
        await txn.wait();
    } catch (error) {
      console.error("Error :", error);
    }
  }

  return (
    <>
    <div className="pages">
        <form onSubmit={handleBatchFreeMint}>
          <h2>Batch Free Mint WL</h2>

          <input
            value={batchFreeMintWL}
            onChange={(e) => setBatchFreeMintWL(e.target.value)}
            placeholder="Enter WL Adds"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleFreeMint}>
          <h2>Free Mint WL</h2>

          <input
            value={freeMintWL}
            onChange={(e) => setFreeMintWL(e.target.value)}
            placeholder="Enter WL Add"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleRemoveFreeMint}>
          <h2>Remove Free Mint WL</h2>

          <input
            value={removeFreeMintWL}
            onChange={(e) => setRemoveFreeMintWL(e.target.value)}
            placeholder="Enter WL Add"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleBatchDiscountMint}>
          <h2>Btach Discount Mint WL</h2>

          <input
            value={batchDiscountMintWL}
            onChange={(e) => setBatchDiscountMintWL(e.target.value)}
            placeholder="Enter Discount Add"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleDiscountMint}>
          <h2>Discount Mint WL</h2>

          <input
            value={discountMintWL}
            onChange={(e) => setDiscountMintWL(e.target.value)}
            placeholder="Enter Discount Add"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleRemoveDiscountMint}>
          <h2>Remove Discount Mint WL</h2>

          <input
            value={removeDiscountMintWL}
            onChange={(e) => setRemoveDiscountMintWL(e.target.value)}
            placeholder="Enter Discount Add"
          />
          <button type="submit">Close</button>
        </form>
    </div>

    <div className="pages">
        <form onSubmit={handleFeeRecipient}>
          <h2>Fee Recipient</h2>

          <input
            value={feeRecipient}
            onChange={(e) => setFeeRecipient(e.target.value)}
            placeholder="Fee Recipient"
          />
          <button type="submit">Close</button>
        </form>
    </div>
    </>
  )
}

export default OwnerPage