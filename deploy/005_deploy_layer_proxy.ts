import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { encodeInitData } from '../utils/encode-init-data';

const impl = 'LayerV0';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, admin } = await getNamedAccounts();
  const data = await encodeInitData(
    impl,
    '__Layer_init',
    [
      'cybertino_layer',
      'LAYER',
      'https://api.cybertino.io/metadata/layer/',
      admin,
    ],
    hre
  );

  const implDeployment = await deployments.get(impl);

  await deploy('LayerProxy', {
    from: deployer,
    log: true,
    args: [implDeployment.address, deployer, data],
  });
};

export default func;
func.tags = ['LayerProxy'];
func.dependencies = [impl];
func.skip = async () => {
  return process.env.INTERACTIVE !== 'true';
};
