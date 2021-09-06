import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer, admin, platformSigner } = await getNamedAccounts();

  const tags = hre.network.tags;

  const name = 'Baby Ranger NFT';
  const sym = 'BABY_RANGER';
  const uri = 'https://api.babyrangers.io/baby/';
  const price = ethers.utils.parseEther('0.09');
  const whitelistPrice = ethers.utils.parseEther('0.06');
  const maxPurchaseNum = 20;
  const maxSupply = 12888;
  const reserveNum = 300;
  const owner = admin; // TODO: fix for Baby Ranger owner address
  console.log(price.toString());

  await deploy('BabyRangerNFT', {
    contract: 'LaunchNFTV0',
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: '__LaunchNFT_init',
    },
    log: true,
    args: [
      name,
      sym,
      uri,
      price,
      whitelistPrice,
      maxPurchaseNum,
      maxSupply,
      reserveNum,
      owner,
      platformSigner,
    ],
  });
};

export default func;
func.tags = ['BabyRanger', 'launch'];
