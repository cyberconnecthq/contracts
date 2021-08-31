import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CMCLayerV0, MockAggregator } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const rare = [
  'QmWGe2ukjLBtjQPPtkA4e36m9NQtNP6ZR6N8LAmDk5tsUb',
  'QmX6mnYA3azhrVnUWWNPeBmnGQ3rvBWEUbQ5ekqg581BE6',
  'QmWGe2ukjLBtjQPPtkA4e36m9NQtNP6ZR6N8LAmDk5tsUb',
];

const layers = [rare];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw "error"
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let CMCLayer = await deployments.get('CMCLayerV0_ALPACA');
  const layer: CMCLayerV0 = await getContract(CMCLayer);
  const layerAdmin: CMCLayerV0 = layer.connect(admin.wallet);

  console.log('# Create ALPACA Layer');
  for (let i = 0; i < layers.length; i++) {
    const tx = await layerAdmin.create(admin.address, layers[i], 0, '0x');
    const receipt = await tx.wait();
    console.log('blocknumber', receipt.blockNumber);
  }

  const id = await layer.id();
  if (id.toNumber() !== 1) {
    console.log('ERRRRR');
  }
  console.log('ALPACA total id', id.toString());

  return true;
};

export default func;
func.tags = ['CMCLayerMigrate_ALPACA', 'interactive'];
func.dependencies = ['CMCLayerV0_ALPACA'];
func.id = '007_CMCLayerMigrate_ALPACA';
func.skip = async ({ network }) => {
  if (network.name === 'mainnet' || network.name === 'rinkeby') {
    return true;
  }
  return false;
};
