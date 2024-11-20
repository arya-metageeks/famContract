import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Navigation from './components/Navigation';

import votingDappABI from './abis/votinDapp.json';

import config from './config.json';
import OwnerPage from './components/OwnerPage';
import VoterPage from './components/VoterPage';
import PollInfo from './components/PollInfo';
// import Winner from './components/Winner';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [provider, setProvider] = useState(null)

  const [votingDappContract, setVotingDappContract] = useState(null)
  const [contractOwner, setContractOwner] = useState(null)

  const [totalNoOfPolls, setTotalNoOfPoles] = useState(0);
  // const [winner, setWinners] = useState("N/A");

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

        //Contract Deployment
        const votinDappContract = new ethers.Contract(config[chainIdString].votingDapp.address, votingDappABI, provider)
        const votinDappContractAddress = await votinDappContract.getAddress()

        console.log(`votinDappContractAddress: ${votinDappContractAddress}`)
        setVotingDappContract(votinDappContract)

        const owner = await votinDappContract.i_owner();
        setContractOwner(owner);
        console.log(`Owner:${contractOwner}`)

        const totalNoOfPolls = await votinDappContract.getTotalPolls();
        console.log(`totalNoOfPolls: ${totalNoOfPolls}`)
        setTotalNoOfPoles(totalNoOfPolls);

        window.ethereum.on("accountsChanged", async () => {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const account = ethers.getAddress(accounts[0]);
          setCurrentAccount(account);
        });
      }
    } catch (error) {
      console.log("Error", error)

    }
  }

  useEffect(() => {
    localBlockchainData();
  }, []);

  return (
    <>
        <Navigation currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} />
        <PollInfo votingDappContract={votingDappContract} totalNoOfPolls={totalNoOfPolls}/>
          {currentAccount == contractOwner ?
          <OwnerPage votingDappContract={votingDappContract} provider={provider} /> :  
          <VoterPage votingDappContract={votingDappContract} provider={provider} totalNoOfPolls={totalNoOfPolls}/>
        }
        {/* <Winner winner={winner}/> */}
    </>
  );
}

export default App;
