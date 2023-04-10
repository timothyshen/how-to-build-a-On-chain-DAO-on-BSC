const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();

const path = require("path");
module.exports = {
  contracts_build_directory: path.join(__dirname, "client/app/utils/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    bscTestnet: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://data-seed-prebsc-2-s1.binance.org:8545`
        ),
      network_id: 97,
      confirmations: 2,
      //timeoutBlocks: 200,
      skipDryRun: true,
    },
    bscMainnet: {
      provider: () =>
        new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
  db: {
    enabled: false,
  },
};
