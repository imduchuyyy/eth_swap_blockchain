const EthSwap = artifacts.require("./../src/contracts/EthSwap.sol");
const Token = artifacts.require("../src/contracts/Token.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Token);
  const token = await Token.deployed()

  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed()
  await token.transfer(ethSwap.address, '1000000000000000000000000')
};
