require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "moon stock bird piano vast major omit camp anxiety dinner cluster cart"

module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/4a310c6e551440a39716fc664d8e5021");
      },
      network_id: '3',
    },
    contracts_directory: './src/contracts/',
  }
}
