import React, { useEffect, useState } from "react";
import { ethers } from "ethers";  // Change this from hardhat to ethers
import axios from 'axios';

const BuyPage = ({
  famDomainMintingV1Contract,
  provider,
  domain,
  setDomain,
}) => {
  const [freeDomainName, setFreeDomainName] = useState("");
  const [domainOwner, setDomainOwner] = useState("");
  const [getDomain, setGetDomain] = useState("");
  const [discountDomainName, setDiscountDomainName] = useState("");
  //   const [discountDomainName, setDiscountDomainName] = useState("");
  const [latest_price, setLatest_price] = useState("0");  // Changed to string

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data.ethereum.usd;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      throw error;
    }
  };

  const calculateEthForUSD = async (usdAmount = 5) => {
    try {
      // Assuming fetchEthPrice() retrieves the current ETH price in USD
      const ethPriceInUSD = await fetchEthPrice();
      // console.log("Current ETH price in USD:", ethPriceInUSD);

      // Calculate the required ETH equivalent to the given USD amount
      const ethAmount = (usdAmount / ethPriceInUSD).toFixed(18); // 18 decimal places for precision in ETH
      console.log(`ETH equivalent for $${usdAmount} USD:`, ethAmount);

      // Convert ethAmount to a BigNumber for further use in contract interactions
      const ethAmountBN = ethers.parseEther(ethAmount.toString());
      console.log(
        "ETH amount in wei (BigNumber format):",
        ethAmountBN.toString()
      );

      // You can now use ethAmountBN in your contract interactions or send as a payment amount
      setLatest_price(ethAmount.toString());  // Store as string
      return ethAmountBN;
    } catch (error) {
      console.error("Error fetching or calculating ETH amount:", error);
    }
  };

  const handleFreeMintDomain = async (e) => {
    e.preventDefault();
    await freeDomainMint(freeDomainName);
    setDomain(domain);
  };

  const handleDiscountMint = async (e) => {
    e.preventDefault();
    let latestPrice = await calculateEthForUSD();
    console.log("latestPrice from form: ", latestPrice)
    let discountAmount = latestPrice / 2n;
    // let discountPriceInWei = ethers.parseEther(discountAmount.toString());

    await discountDomainMint(discountDomainName, discountAmount, latestPrice);
    setDomain(domain);
  };

  const handleDomainOwner = async (e) => {
    e.preventDefault();
    await getDomainOwner(getDomain);
  };



  const freeDomainMint = async (freeDomainName) => {
    console.log("Free Domain Name: ", freeDomainName);

    try {
      const signer = await provider.getSigner();
      const txn = await famDomainMintingV1Contract
        .connect(signer)
        .freeMintDomain(freeDomainName);
      await txn.wait();
    } catch (error) {}
  };

  const discountDomainMint = async (
    discountDomainName,
    discountPrice,
    latest_price
  ) => {
    console.log("Discount Domain Name: ", discountDomainName);

    try {
      const signer = await provider.getSigner();
      console.log("Price in function",discountPrice)
      const txn = await famDomainMintingV1Contract
        .connect(signer)
        .discountMintDomain(discountDomainName, latest_price, {
          value: discountPrice.toString(),  
        });
      await txn.wait();

    console.log("Here")
    } catch (error) {}
  };

  const getDomainOwner = async (getDomain) => {
    console.log("getDomain: ", getDomain);

    try {
      const owner = await famDomainMintingV1Contract.getDomainOwner(getDomain);
      setDomainOwner(owner);
    } catch (error) {}
  };

  return (
    <>
      <header>
        <p className="header__subtitle">Seek and buy available domain names</p>
        <h2 className="header__title">It all begins with a domain name.</h2>
        <div className="header__search">
          <form onSubmit={handleFreeMintDomain}>
            <input
              value={freeDomainName}
              className="header__input"
              placeholder="Find your domain"
              onChange={(e) => setFreeDomainName(e.target.value)}
            />
            <button type="submit" className="header__button">
              Buy It
            </button>
          </form>
        </div>
      </header>

        <div className="btn">
      <div className="header__search">
        <form onSubmit={handleDiscountMint}>
          <input
            value={discountDomainName}
            type="text"
            className="header__input"
            placeholder="Discount Domain Buy"
            onChange={(e) => setDiscountDomainName(e.target.value)}
          />
          <button type="submit" className="header__button">
            Buy It
          </button>
        </form>
      </div>

      <div className="header__search">
        <form onSubmit={handleDomainOwner}>
          <input
            value={getDomain}
            type="text"
            className="header__input"
            placeholder="Domain Owner"
            onChange={(e) => setGetDomain(e.target.value)}
          />
          <button type="submit" className="header__button">
            Get
          </button>
        </form>
      </div>

      </div>

      <button className="header__button_" onClick={() =>{
        calculateEthForUSD();
        console.log("Called")
      }}><b>Calculate</b></button>
      <h1 className="price">Latest Price ETH/USD: {latest_price}</h1>
      <h1 className="head">Domain Owner: {domainOwner}</h1>

    </>
  );
};

export default BuyPage;
