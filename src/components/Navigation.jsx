import { ethers } from 'ethers'

const Navigation = ({ currentAccount, setCurrentAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const currentAccount = ethers.getAddress(accounts[0])
    setCurrentAccount(currentAccount)
  }

  return (
<nav>
      <div className='nav__brand'>
        <h1>Crypto Daddy</h1>
      </div>

      {currentAccount ? (
        <button
          type="button"
          className='nav__connect'
        >
          {currentAccount.slice(0, 6) + '...' + currentAccount.slice(38, 42)}
        </button>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
}

export default Navigation;