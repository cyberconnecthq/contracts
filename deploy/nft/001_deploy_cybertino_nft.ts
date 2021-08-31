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
    name = 'CybertinoNFT';
    sym = 'CYBER_NFT';
    signer = '0x3c00F16C8ead50ea73535e41a4eB351648738f7c';
  } else if (tags['prd-testnet']) {
    baseUri = 'https://api.cybertino.io/metadata/nft/';
    name = 'CybertinoNFTRinkeby';
    sym = 'CYBER_NFT_RINKEBY';
  } else {
    baseUri = 'https://api.stg.cybertino.io/metadata/nft/';
    name = 'CybertinoNFTTest';
    sym = 'CYBER_NFT_TEST';
  }

  await deploy('CybertinoNFTV0', {
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
func.tags = ['CybertinoNFTV0', 'nft'];
func.skip = async ({ network }) => {
  if (network.name === 'bsc' || network.name === 'bsc-testnet') {
    return true;
  }
  return false;
};
