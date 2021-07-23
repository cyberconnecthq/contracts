import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy('LayerV0', {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = ['LayerV0'];
func.skip = async () => {
  return process.env.INTERACTIVE !== 'true';
};
