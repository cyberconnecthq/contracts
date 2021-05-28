import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const dep = 'InfluencerV0';
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const influencer = await deployments.get(dep);

  await deploy('InfluencerBeacon', {
    from: deployer,
    log: true,
    args: [influencer.address],
  });
};

func.tags = ['InfluencerBeacon'];
func.dependencies = [dep];

export default func;
