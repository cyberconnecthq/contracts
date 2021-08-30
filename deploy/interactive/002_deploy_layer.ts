import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer, admin } = await getNamedAccounts();

  let name: string, sy: string, oracle: string;
  let interval: number, threshold: number;
  const maxState = 3;

  if (network.tags['prd']) {
    name = 'CybertinoCoinMarketCapLayer';
    sy = 'CYBER_CMC_LAYER';
  } else if (network.tags['stg']) {
    name = 'CybertinoCoinMarketCapLayerTest';
    sy = 'CYBER_CMC_LAYER_TEST';
  } else {
    throw 'Network not supported';
  }

  if (network.name === 'rinkeby') {
    oracle = '0xECe365B379E1dD183B20fc5f022230C044d51404';
    interval = 30 * 60;
    threshold = 5;
  } else if (network.name === 'mainnet') {
    oracle = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c';
    interval = 24 * 60 * 60; // one day
    threshold = 500;
  } else if (network.name === 'hardhat') {
    let Aggregator = await deployments.get('MockAggregator');
    oracle = Aggregator.address;
    interval = 24 * 60 * 60; // one day
    threshold = 500;
  } else {
    throw 'Network not supported';
  }

  const deployResult = await deploy('CMCLayerV0', {
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: 'CMCLayer_init',
    },
    log: true,
    args: [name, sy, oracle, admin, interval, threshold, maxState],
  });
};

export default func;
func.tags = ['CMCLayerV0', 'interactive'];
func.dependencies = ['MockAggregator'];
func.skip = async ({ network }) => {
  if (network.name === 'bsc' || network.name === 'bsc-testnet') {
    return true;
  }
  return false;
};
