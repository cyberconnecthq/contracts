import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber } from '@ethersproject/bignumber';
import { submit } from './etherscan-verify-proxy';
import { sign, verifyInfluencer } from './influencers';

task(
  'etherscan-verify-proxy',
  'Verify proxy contract on Etherscan',
  async (_, hre) => {
    const { host, networkName } = await getNetwork(hre);
    await submit(hre, host, networkName);
  }
);

interface argsType {
  name: string;
}

task('sign-influencer', 'Sign a Influencer')
  .addParam(
    'name',
    'Influencer name must be lower case and snake, like binance_smart_chain'
  )
  .setAction(async (args: argsType, hre) => {
    const { name } = args;
    const { host, networkName } = await getNetwork(hre);
    await sign(name, host, networkName, hre);
  });

task(
  'verify-influencer',
  'Verify all unverified influencer contracts'
).setAction(async (_, hre) => {
  const { host, networkName } = await getNetwork(hre);
  await verifyInfluencer(host, networkName, hre);
});

const getNetwork = async (hre: HardhatRuntimeEnvironment) => {
  const chainId = await getChainId(hre);
  if (chainId === '31337') {
    const err = new Error(
      'Hardhat network is not valid for this task. Please use remote network.'
    );
    console.error(err);
    throw err;
  }
  return etherscanHost(chainId);
};

const getChainId = async (hre: HardhatRuntimeEnvironment): Promise<string> => {
  let chainId = '';
  try {
    chainId = await hre.network.provider.send('eth_chainId');
  } catch (e) {
    console.log('failed to get chainId, falling back on net_version...');
    chainId = await hre.network.provider.send('net_version');
  }

  if (!chainId) {
    throw new Error(`could not get chainId from network`);
  }

  if (chainId.startsWith('0x')) {
    chainId = BigNumber.from(chainId).toString();
  }

  return chainId;
};

const etherscanHost = (chainId: string) => {
  let host = '';
  let networkName = '';
  switch (chainId) {
    case '1':
      host = 'https://api.etherscan.io';
      // TODO: might not be right
      networkName = 'mainnet';
      break;
    case '3':
      host = 'https://api-ropsten.etherscan.io';
      networkName = 'ropsten';
      break;
    case '4':
      host = 'https://api-rinkeby.etherscan.io';
      networkName = 'rinkeby';
      break;
    case '5':
      host = 'https://api-goerli.etherscan.io';
      networkName = 'goerli';
      break;
    case '42':
      host = 'https://api-kovan.etherscan.io';
      networkName = 'kovan';
      break;
    case '97':
      host = 'https://api-testnet.bscscan.com';
      // TODO: might not be right
      networkName = 'bsc-testnet';
      break;
    case '56':
      host = 'https://api.bscscan.com';
      // TODO: might not be right
      networkName = 'bsc';
      break;
    case '128':
      host = 'https://api.hecoinfo.com';
      // TODO: might not be right
      networkName = 'heco';
      break;
    case '256':
      host = 'https://api-testnet.hecoinfo.com';
      // TODO: might not be right
      networkName = 'heco-testnet';
      break;
    default:
      console.error(`Network with chainId: ${chainId} not supported`);
  }
  return { host, networkName };
};
