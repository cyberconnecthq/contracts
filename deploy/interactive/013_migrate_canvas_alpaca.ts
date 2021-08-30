import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const stgTokens = [['59769c3c-870e-46eb-ba92-d522cdb3fbc5', 25]];

const prdTokens = [['59769c3c-870e-46eb-ba92-d522cdb3fbc5', 25]];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw "error"
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let dep = await deployments.get('CybertinoCanvasV0');
  const nft: CybertinoCanvasV0 = await getContract(dep);
  const nftAdmin: CybertinoCanvasV0 = nft.connect(admin.wallet);

  let layerDep = await deployments.get('CMCLayerV0_ALPACA');
  let layerAddress = layerDep.address;
  let tokens = [];
  if (network.tags['prd']) {
    tokens = prdTokens;
  } else if (network.tags['stg']) {
    tokens = stgTokens;
  } else {
    tokens = stgTokens;
  }
  console.log('# Create ALPACA Canvas');
  for (let i = 0; i < tokens.length; i++) {
    const tx = await nftAdmin.createCanvas(
      tokens[i][0] as string,
      '0x',
      [
        {
          layer: layerAddress,
          layerID: i + 1,
        },
      ],
      tokens[i][1] as number
    );
    const receipt = await tx.wait();
    console.log('blocknumber', receipt.blockNumber);
    const id = await nft.id();
    console.log('ALPACA id', id.toString());
  }

  const id = await nft.id();
  if (id.toNumber() !== 1) {
    console.log('ERRRRRR');
  }
  console.log('total ALPACA id', id.toString());

  return true;
};

export default func;
func.tags = ['CybertinoCanvasALPACAMigrate', 'interactive'];
func.dependencies = ['CybertinoCanvasCMCMigrate', 'CMCLayerV0_ALPACA'];
func.id = '008_CybertinoCanvasALPACA';
func.skip = async ({ network }) => {
  if (network.name === 'mainnet' || network.name === 'rinkeby') {
    return true;
  }
  return false;
};
