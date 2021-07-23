import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, admin, platformSigner } = await getNamedAccounts();

  await deploy('CybertinoNFTV0', {
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: 'CybertinoNFT_init',
    },
    log: true,
    args: [
      'CybertinoNFT',
      'https://api.stg.cybertino.io/nft/metadata/',
      'CYBER_NFT',
      platformSigner,
      admin,
    ],
  });
};

export default func;
func.tags = ['CybertinoNFTV0'];
