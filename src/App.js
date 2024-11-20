import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Navigation from './components/Navigation';
import OwnerPage from './components/OwnerPage';
import BuyPage from './components/BuyPage';

import famDomainMintingV1ABI from './abis/fam_domain_minting.json';
import config from './config.json';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contractOwner, setOwner] = useState(null);
  const [domain, setDomain] = useState("");
  const [famDomainMintingV1Contract, setFamDomainMintingV1Contract] = useState(null);

  const localBlockchainData = async () => {
    try {
      if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults");
        const provider = ethers.getDefaultProvider();
        setProvider(provider);
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signerAcc = await provider.getSigner();
        console.log("signer", signerAcc.address);
        setProvider(provider);

        const network = await provider.getNetwork();
        const chainIdString = network.chainId.toString();

        console.log("ChainId->: ",chainIdString);

        // Contract Deployment
        const famDomainMintingV1 = new ethers.Contract(
          config[chainIdString].famDomainMintingV1.address,
          famDomainMintingV1ABI,
          provider
        );
        setFamDomainMintingV1Contract(famDomainMintingV1);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    localBlockchainData();
    // Request accounts if no account is present
    const fetchAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setCurrentAccount(ethers.getAddress(accounts[0])); // Normalize the address
        }
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    const getContractOwner = async () => {
      if (famDomainMintingV1Contract) {
        try {
          const owner = await famDomainMintingV1Contract.owner();
          setOwner(ethers.getAddress(owner)); // Normalize the address
        } catch (error) {
          console.error("Error fetching contract owner:", error);
        }
      }
    };

    getContractOwner();
  }, [famDomainMintingV1Contract]);

  // Add some debug logging
  useEffect(() => {
    if (currentAccount && contractOwner) {
      console.log("Current Account:", currentAccount);
      console.log("Contract Owner:", contractOwner);
      console.log("Are they equal?", currentAccount.toLowerCase() === contractOwner.toLowerCase());
    }
  }, [currentAccount, contractOwner]);

  if (currentAccount === null || contractOwner === null) {
    return <div>Loading...</div>;
  }

  const isOwner = currentAccount.toLowerCase() === contractOwner.toLowerCase();

  return (
    <>
      <Navigation currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} />
      {isOwner ? (
        <OwnerPage 
          famDomainMintingV1Contract={famDomainMintingV1Contract} 
          provider={provider} 
        />
      ) : (
        <BuyPage 
          famDomainMintingV1Contract={famDomainMintingV1Contract} 
          provider={provider} domain={domain} setDomain={setDomain}
        />
      )}
    </>
  );
}

export default App;