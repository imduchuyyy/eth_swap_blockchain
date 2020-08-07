import React, { useCallback, useEffect, useState, useRef } from 'react';
import Web3 from 'web3'
import './App.css';
import EthSwap from './../abis/EthSwap.json'
import Token from './../abis/Token.json'

const App = () => {
  const [account, setAccount] = useState([])
  const [etherBalance, setEtherBalance] = useState([])
  const [tokenBalance, setTokenBalance] = useState([])
  const [isSell, setIsSell] = useState(false)
  const [receiveValue, setReceiveValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = useRef()
  const etherSwap = useRef()
  const inputRef = useRef()

  const loadBlockchainData = useCallback(async () => {
    const { web3 } = window
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
    const etherBalance = await web3.eth.getBalance(accounts[0])
    setEtherBalance(etherBalance)

    const idNetwork = await web3.eth.net.getId() || ''
    // load Token contract
    const { address: tokenAddress } = Token.networks[idNetwork] || ''
    const tokenContract = new web3.eth.Contract(Token.abi, tokenAddress)
    const tokenBalance = await tokenContract.methods.balanceOf(accounts[0]).call()
    token.current = tokenContract
    setTokenBalance(tokenBalance.toString())

    // load EtherSwap contract
    const { address: etherSwapAddress } = EthSwap.networks[idNetwork] || ''
    const etherSwapContract = new web3.eth.Contract(EthSwap.abi, etherSwapAddress)
    etherSwap.current = etherSwapContract
  })

  const loadWeb3 = useCallback(async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      console.log('not ethereum platform found')
    }
  })

  const handleSwapToken = useCallback(async () => {
    setLoading(true)
    if (etherSwap.current) {
      const { methods } = etherSwap.current
      if (isSell) {
        const tokenAmount = window.web3.utils.toWei(inputRef.current.value.toString(), 'Ether')
        token.current.methods.approve(etherSwap.current.address, tokenAmount)
              .send({from: account})
              .on('transactionHash', (hash) => {
                methods.sellTokens(tokenAmount)
                .send({ from: account })
                .on('transactionHash', (hash) => {
                  setLoading(false)
                })
              })
      } else {
        methods.buyTokens()
              .send({ from: account, value: window.web3.utils.toWei(inputRef.current.value.toString(), 'Ether')})
              .on('transactionHash', () => {
                setLoading(false)
              })
      }
    }
  })
  
  const handleChangeInput = useCallback(async () => {
    if (isSell) {
      setReceiveValue(parseInt(inputRef.current.value) / 100)
    } else {
      setReceiveValue(parseInt(inputRef.current.value) * 100)
    }
  })

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [loading])

  return (
    loading ? 'loading...' : (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            {account || ''}
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                  <label>{
                    isSell ? 'Sell Token' : 'Buy token'
                    }</label>
                  <br></br>
                  <label>{`Ether balance : ${window.web3.utils ? window.web3.utils.fromWei(etherBalance.toString(), 'ether') : ''}`}</label>
                  <br></br>
                  <label>{`Token balance: ${window.web3.utils ? window.web3.utils.fromWei(tokenBalance.toString(), 'ether') : ''}`}</label>
                  <br></br>
                  <label>{`Enter ${isSell ? 'Token' : 'Ether'}: `}</label>
                  <input ref={inputRef} onChange={handleChangeInput} type='number'></input>
                  <label>{`${isSell ? 'Ether: ': 'Token: ' } ${receiveValue || ''}`}</label>
                  <br></br>
                  <button onClick={() => { setIsSell(false) }}>Buy</button>
                  <button onClick={() => { setIsSell(true) }}>Sell</button>
                  <button onClick={handleSwapToken}>Swap</button>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  );
}

export default App;
