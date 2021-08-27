import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CMCLayerV0, MockAggregator } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const rare = [
  'QmeC6qUyMpTSfyMQd1USevULqaPrnkSBVd1dXYDUez7U7o',
  'QmRuwWzVMQgYJhPC9YcBeojocLUFRWAhmNZQXkpe4Up2VF',
  'QmeAnaK9vedmUCJ9gmBH9SFgjerpZU5Teju9TwsRhLUGQF',
];

const common = [
  'QmYpgQEdWtP16SXkS7wE9W6qgGNH73BEhc6Tqt1iyoVZWv',
  'QmUyJ3THNwVAQw41YrRef3REb5t9DAbTs9c7LdsdHT9RzS',
  'QmZ3WMubDVFDWLQkXbTxD424wRv4SYNpEQSW12bAfPy62f',
];

const layers = [rare, common];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw "error"
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let CMCLayer = await deployments.get('CMCLayerV0_BSC');
  const layer: CMCLayerV0 = await getContract(CMCLayer);
  const layerAdmin: CMCLayerV0 = layer.connect(admin.wallet);

  console.log('# Create BSC Layer');
  for (let i = 0; i < layers.length; i++) {
    const tx = await layerAdmin.create(admin.address, layers[i], 0, '0x');
    const receipt = await tx.wait();
    console.log('blocknumber', receipt.blockNumber);
  }

  const id = await layer.id();
  console.log('BSC total id', id.toString());

  return true;
};

export default func;
func.tags = ['CMCLayerMigrate_BSC', 'interactive'];
func.dependencies = ['CMCLayerV0_BSC'];
func.id = '004_CMCLayerMigrate_BSC';
