import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const stgTokens = [
  ['39268218-c683-4388-824d-395a1ec80435', 10],
  ['d39b5381-0ef0-48f8-a16b-fdff67042622', 10],
  ['1241ca9c-c42a-4a04-b405-e205addc5ed8', 50],
  ['08a70800-15e8-4109-b112-426c0d4f8e9f', 240],
  ['e352db78-d31b-4a95-b8e4-5457c6f67ed3', 690],
];

const prdTokens = [
  ['39268218-c683-4388-824d-395a1ec80435', 10],
  ['d39b5381-0ef0-48f8-a16b-fdff67042622', 10],
  ['1241ca9c-c42a-4a04-b405-e205addc5ed8', 50],
  ['08a70800-15e8-4109-b112-426c0d4f8e9f', 240],
  ['e352db78-d31b-4a95-b8e4-5457c6f67ed3', 690],
];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let dep = await deployments.get('CybertinoCanvasV0');
  const nft: CybertinoCanvasV0 = await getContract(dep);
  const nftAdmin: CybertinoCanvasV0 = nft.connect(admin.wallet);

  let layerDep = await deployments.get('CMCLayerV0');
  let layerAddress = layerDep.address;
  let tokens = [];
  if (network.tags['prd']) {
    tokens = prdTokens;
  } else if (network.tags['stg']) {
    tokens = stgTokens;
  } else {
    tokens = stgTokens;
  }
  for (let i = 1; i < stgTokens.length; i++) {
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
    console.log(receipt.blockNumber);
  }

  const id = await nft.id();
  console.log(id);

  return true;
};

export default func;
func.tags = ['CybertinoCanvasCMC', 'interactive'];
func.dependencies = ['CMCLayerV0'];
func.id = '002_CybertinoCanvasCMC';
