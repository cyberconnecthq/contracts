import { task, HardhatUserConfig } from 'hardhat/config';

import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';

// This is only for hardhat console
import '@nomiclabs/hardhat-web3';
import './scripts/tasks';

import '@nomiclabs/hardhat-etherscan';

import { node_url, accounts, etherscanApiKey } from './utils/network';
import 'dotenv/config';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

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
      accounts: accounts('rinkeby'),
    },
    'bsc-testnet': {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: accounts('rinkeby'),
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      accounts: accounts('mainnet'),
    },
  },
  namedAccounts: {
    deployer: 0,
    admin: 1,
  },
  etherscan: {
    apiKey: etherscanApiKey('bsc'),
    // apiKey: etherscanApiKey('eth'),
  },
};

export default config;
