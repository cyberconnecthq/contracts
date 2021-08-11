import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, admin, platformSigner } = await getNamedAccounts();

  const tags = hre.network.tags;

  let baseUri: string;
  let name: string;
  let sym: string;
  let signer = platformSigner;
  if (tags['prd']) {
    baseUri = 'https://api.cybertino.io/metadata/nft/';
    name = 'CybertinoPartnerNFT';
    sym = 'CYBER_PARTNER_NFT';
    signer = '0x36459993cd2d43cB944997aD1C5b9cE4e7f7E236';
  } else if (tags['prd-testnet']) {
    baseUri = 'https://api.cybertino.io/metadata/nft/';
    name = 'CybertinoPartnerNFTRinkeby';
    sym = 'CYBER_NFT_PARTNER_RINKEBY';
  } else {
    baseUri = 'https://api.stg.cybertino.io/metadata/nft/';
    name = 'CybertinoPartnerNFTTest';
    sym = 'CYBER_PARTNER_NFT_TEST';
  }

  await deploy('CybertinoPartnerNFTV0', {
    contract: 'CybertinoNFTV0',
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      methodName: 'CybertinoNFT_init',
    },
    log: true,
    args: [name, baseUri, sym, signer, admin],
  });
};

export default func;
func.tags = ['CybertinoNFTV0_Partner', 'nft'];
