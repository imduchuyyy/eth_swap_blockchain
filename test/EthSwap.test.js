const { assert } = require('chai')

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function convertToken (n) {
  return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', (accounts) => {
  let token, ethSwap

  before(async() => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)

    await token.transfer(ethSwap.address, convertToken('1000000'))
  })

  describe('Token deployment', async () => {
    it('Contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('EthSwap deployment', async () => {
    it('Contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
    })

    it('Contract has token', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), convertToken('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result, invertor

    before(async () => {
      invertor = accounts[1]
      result = await ethSwap.buyTokens({from: invertor, value: convertToken('1')})
    })

    it('Allows user to instantly purchase tokens from ethSwap for fixed price', async () => {
      let inverterBalance = await token.balanceOf(invertor)
      assert.equal(inverterBalance.toString(), convertToken('100'))

      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), convertToken('999900'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))
    })
  })
})