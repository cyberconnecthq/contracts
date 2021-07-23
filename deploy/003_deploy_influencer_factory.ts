import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const InfluencerBeacon = await deployments.get('InfluencerBeacon');

  await deploy('InfluencerFactory', {
    from: deployer,
    log: true,
    args: [InfluencerBeacon.address],
  });
};

export default func;
func.tags = ['InfluencerFactory'];
func.dependencies = ['InfluencerBeacon'];
func.skip = async () => {
  return process.env.INTERACTIVE !== 'true';
};
