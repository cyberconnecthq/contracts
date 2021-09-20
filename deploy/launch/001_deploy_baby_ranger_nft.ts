import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { network, deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const {
    deployer,
    admin: hardhatAdmin,
    platformSigner: hardhatSigner,
  } = await getNamedAccounts();

  const name = 'Baby Ranger';
  const sym = 'BABY_RANGER';
  const uri = 'https://api.babyrangers.io/baby/';
  const price = ethers.utils.parseEther('0.12');
  const whitelistPrice = ethers.utils.parseEther('0.06');
  const maxPurchaseNum = 5;
  const maxSupply = 13888;
  const reserveNum = 300;
  let owner = '0x93681F89c1163e4828B35baF2DD32D02C32954A4';
  let signer = '0x24C205f3a9DEBA433319617296df8c653891cb0e';
  if (network.name === 'hardhat') {
    owner = hardhatAdmin;
    signer = hardhatSigner;
  }

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
      signer,
    ],
  });
};

export default func;
func.tags = ['BabyRanger', 'launch'];
