import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw "error"
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer, admin } = await getNamedAccounts();

  let name: string, sy: string, oracle: string;
  let interval: number, threshold: number;
  const maxState = 3;

  if (network.tags['prd']) {
    name = 'CybertinoBSCLayer';
    sy = 'CYBER_BSC_LAYER';
  } else if (network.tags['stg']) {
    name = 'CybertinoBSCLayerTest';
    sy = 'CYBER_BSC_LAYER_TEST';
  } else {
    throw 'Network not supported';
  }

  if (network.name === 'rinkeby') {
    oracle = '0xcf0f51ca2cDAecb464eeE4227f5295F2384F84ED';
    interval = 30 * 60;
    threshold = 5;
  } else if (network.name === 'mainnet') {
    oracle = '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A';
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

  const deployResult = await deploy('CMCLayerV0_BSC', {
    contract: 'CMCLayerV0',
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
func.tags = ['CMCLayerV0_BSC', 'interactive'];
func.dependencies = ['MockAggregator'];
// func.runAtTheEnd = true; // For test environment to have  price aggregator deployed first
