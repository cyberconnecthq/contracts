import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy('MockAggregator', {
    from: deployer,
    log: true,
    args: [100, 1628031317],
  });
};

export default func;
func.tags = ['MockAggregator', 'CMCLayerV0', 'interactive', 'mock'];
func.skip = async ({ network }) => {
  if (network.name !== 'hardhat') {
    return true;
  }
  return false;
};
