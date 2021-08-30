import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const stgTokens = [
  ['9305846e-d35b-483e-894c-12d3fc4eb33f', 1000],
  ['011353ea-6f36-482f-a48a-ff8d3847b6b9', 1000],
];

const prdTokens = [
  ['9305846e-d35b-483e-894c-12d3fc4eb33f', 1000],
  ['011353ea-6f36-482f-a48a-ff8d3847b6b9', 1000],
];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw "error"
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let dep = await deployments.get('CybertinoCanvasV0');
  const nft: CybertinoCanvasV0 = await getContract(dep);
  const nftAdmin: CybertinoCanvasV0 = nft.connect(admin.wallet);

  let layerDep = await deployments.get('CMCLayerV0_BSC');
  let layerAddress = layerDep.address;
  let tokens = [];
  if (network.tags['prd']) {
    tokens = prdTokens;
  } else if (network.tags['stg']) {
    tokens = stgTokens;
  } else {
    tokens = stgTokens;
  }
  console.log('# Create BSC Canvas');
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
    console.log('BSC id', id.toString());
  }

  const id = await nft.id();
  console.log(id);

  return true;
};

export default func;
func.tags = ['CybertinoCanvasBSCMigrate', 'interactive'];
func.dependencies = ['CybertinoCanvasCMCMigrate', 'CMCLayerV0_BSC'];
func.id = '005_CybertinoCanvasBSC';
func.skip = async ({ network }) => {
  if (network.name === 'bsc' || network.name === 'bsc-testnet') {
    return true;
  }
  return false;
};
