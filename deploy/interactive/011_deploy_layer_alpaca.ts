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
    name = 'CybertinoALPACALayer';
    sy = 'CYBER_ALPACA_LAYER';
  } else if (network.tags['stg']) {
    name = 'CybertinoALPACALayerTest';
    sy = 'CYBER_ALPACA_LAYER_TEST';
  } else {
    throw 'Network not supported';
  }

  if (network.name === 'bsc-testnet') {
    oracle = '0xe0073b60833249ffd1bb2af809112c2fbf221DF6'; // NOT Available
    interval = 4 * 60 * 60; // 4 hour
    threshold = 300;
  } else if (network.name === 'bsc') {
    oracle = '0xe0073b60833249ffd1bb2af809112c2fbf221DF6';
    interval = 4 * 60 * 60; // 4 hour
    threshold = 300;
  } else if (network.name === 'hardhat') {
    let Aggregator = await deployments.get('MockAggregator');
    oracle = Aggregator.address;
    interval = 24 * 60 * 60; // one day
    threshold = 500;
  } else {
    throw 'Network not supported';
  }

  const deployResult = await deploy('CMCLayerV0_ALPACA', {
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
func.tags = ['CMCLayerV0_ALPACA', 'interactive'];
func.dependencies = ['MockAggregator'];
func.skip = async ({ network }) => {
  if (network.name === 'mainnet' || network.name === 'rinkeby') {
    return true;
  }
  return false;
};
