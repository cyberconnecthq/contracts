import { task, HardhatUserConfig } from 'hardhat/config';

import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';

// This is only for hardhat console
import '@nomiclabs/hardhat-web3';
// XXX(@ryanli): This following line makes typechain fail
// import './scripts/tasks';
import './scripts/task-scaffold-eth';

import '@nomiclabs/hardhat-etherscan';

import { node_url, accounts, etherscanApiKey } from './utils/network';
import 'dotenv/config';

import 'hardhat-gas-reporter';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
//
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    rinkeby: {
      url: node_url('rinkeby'),
      accounts: accounts('testnet'),
      gas: 2100000,
      tags: ['stg'],
    },
    'rinkeby-prd': {
      // rinkeby with production server
      url: node_url('rinkeby'),
      accounts: accounts('testnet'),
      gas: 2100000,
      tags: ['prd-testnet'],
    },
    mainnet: {
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
      tags: ['prd'],
    },
    'bsc-testnet': {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: accounts('testnet'),
      tags: ['stg'],
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      accounts: accounts('mainnet'),
      tags: ['prd'],
    },
    hardhat: {
      tags: ['stg'],
    },
  },
  namedAccounts: {
    deployer: 0,
    admin: 1,
    platformSigner: 2,
  },
  etherscan: {
    apiKey: etherscanApiKey('eth'),
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.CMC_KEY,
  },
};

export default config;
