import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { getAccounts, getContract } from '@utils/index';

const nfts = [
  ['8a0437ec-6067-49dd-b21f-83c2f1669221', 75],
  ['6b9b3c74-9308-4be8-a76e-6e945ca5fca7', 150],
  ['100f31d1-4190-4d0f-a9ba-2df9890b111', 15],
];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, ethers } = hre;
  const [_, admin] = await getAccounts();

  let dep = await deployments.get('CybertinoPartnerNFTV0');
  const nft = await getContract(dep);
  const nftAdmin = nft.connect(admin.wallet);

  const cids = [];
  const datas = [];
  const maxSupplys = [];
  for (let i = 0; i < nfts.length; i++) {
    cids.push(nfts[i][0]);
    maxSupplys.push(nfts[i][1]);
    datas.push('0x');
  }

  const tx = await nftAdmin.batchCreate(cids, datas, maxSupplys);
  const receipt = await tx.wait();
  console.log('blocknumber', receipt.blockNumber);
  const id = await nft.id();
  if (id.toNumber() !== 3) {
    console.log('ERRRRRRRRRRR');
  }
  console.log('total partner nfts on bsc', id.toNumber());
  return true;
};

func.tags = ['003_CybertinoNFTV0_BSC_Partner_Migration', 'nft'];
func.id = '003_CybertinoNFTV0_BSC_Partner_Migration';
func.dependencies = ['CybertinoNFTV0_Partner'];

export default func;
func.skip = async ({ network }) => {
  if (network.name === 'mainnet' || network.name === 'rinkeby') {
    return true;
  }
  return false;
};
