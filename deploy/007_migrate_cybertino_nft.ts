import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { getAccounts, getContract } from '@utils/index';

const nfts = [
  ['56a706ff-987b-402f-8a81-e4c86bd77300', 11],
  ['cebc4886-631f-482c-8ea2-a29085d74040', 111],
  ['b1f1f777-ddd9-4e40-a937-c2152f099168', 777],
  ['3594b480-bf57-4990-a341-51d9aabb5941', 50],
  ['3d09ef8f-efb1-4963-80c5-5a89b24d3044', 700],
];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, ethers } = hre;
  const [_, admin] = await getAccounts();

  let dep = await deployments.get('CybertinoNFTV0');
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
  const gasPrice = ethers.utils.parseUnits('15', 'gwei');

  await nftAdmin.batchCreate(cids, datas, maxSupplys, {
    gasLimit: 3000000,
    gasPrice: gasPrice,
  });
  const id = await nft.id();
  console.log(id.toNumber());
  return true;
};

func.tags = ['CybertinoNFTV0_Migration'];
func.id = '001';

export default func;
