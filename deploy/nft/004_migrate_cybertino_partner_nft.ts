import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { getAccounts, getContract } from '@utils/index';

const nfts = [
  ['000d5084-65c7-4de9-ba53-32707e358fc3', 1],
  ['034a414a-d311-406b-a229-3446c435845b', 8],
  ['07773bf6-7664-4c63-a83d-4fb1cd6f83aa', 1],
  ['0b1aa3b5-5e36-4c00-a57b-ad9d9ebe79e4', 50],
  ['145e440a-51ec-44b0-b0d3-fb56e08d08c9', 1],
  ['200f31d1-4190-4d0f-a9ba-2df9890b1414', 100],
  ['210dddff-f782-45ba-bb50-1df03ae41d0b', 500],
  ['26ed1079-b1de-4a5e-87c1-c728983c2618', 250],
  ['28cf4381-7c38-40e0-a2af-14b805477655', 1],
  ['3638606e-d88b-4665-a28c-1a93febcc1ae', 1],
  ['3ac4050c-bae2-4702-b6dc-ab4d623543d8', 50],
  ['3b6b8f46-3423-4dce-8bd3-14a56d644165', 500],
  ['3bf64fa4-a403-4917-bc2f-07da03c6d7a0', 500],
  ['3f9046bc-d292-446a-aae1-edba12f1845f', 50],
  ['419a873f-eb0a-4937-9c2a-7cda833e1013', 50],
  ['4241ebf1-b402-4655-b0ae-2dca439253e8', 250],
  ['46a6f72d-acc8-44dd-be28-f20ccf8e8fbb', 50],
  ['49bd2cc1-802c-4bfb-8a93-f2642197a62f', 50],
  ['533dbd21-3e8b-4141-90cf-d7353edaed1e', 250],
  ['593414e4-6cd5-439d-8d16-03449b58638a', 250],
  ['6725dcb4-e592-4149-b8ab-ed9715b4abca', 250],
  ['67556335-2852-4595-b9e5-9387d2578ee4', 50],
  ['6c3550d6-7005-49e0-aa69-26f70d6af33d', 50],
  ['6f30113d-5c41-4eb7-aef4-6b30588406e6', 500],
  ['7501a78b-cd24-4857-906e-3f74eda991a3', 150],
  ['7c3d5c8e-d809-4351-8f8d-f486c3472c3e', 1],
  ['80d9eb0b-ee2c-453e-bbf5-c35d512df9e6', 500],
  ['8cf0f8c4-c41d-4691-9fb5-06ab4e4ee797', 500],
  ['8f4d87c0-c176-4ef9-87e7-141feeb44479', 1],
  ['9722ac4f-44a8-46bf-93be-549e8d4f9595', 1],
  ['a2a229b9-cef2-4253-a8c6-514a0b88ac5f', 500],
  ['ac9b229b-ae6c-4d0e-8aeb-568d3a012347', 50],
  ['b1419f17-2d30-4891-93e4-dfbc61696e24', 250],
  ['b59d265f-dd46-4c13-aa31-38ffec1d53f1', 250],
  ['b5ece7cd-30dd-4775-bfa5-8107c9a98939', 1],
  ['b7e0f73d-4c42-49a0-a292-dbce37a46d11', 1000000],
  ['b816897f-c9fe-4129-b8ad-1b3275a08380', 500],
  ['bae75124-2994-4b0d-9554-453444c0836a', 1000000],
  ['bdcf621f-9d6c-48b0-8d42-1ebf117b396c', 50],
  ['c357a8df-c051-4666-804d-be12caa18e91', 60],
  ['c3f2ae19-e159-4ca4-bc01-c7b65123d9ff', 1],
  ['d058b419-77ea-4961-944e-86d7c873974c', 1],
  ['d7a140f2-75b0-4706-b3b3-63a5458a5ea9', 50],
  ['db719e19-6a49-403b-8f56-e9fc70ac4fe8', 500],
  ['db93c63c-5389-4591-98f8-00d180ad292e', 1],
  ['dcdad229-90f2-4a6a-a6ac-39ec7b1076f6', 250],
  ['e76edd48-3319-407a-9560-46c6ffed647d', 500],
  ['ef519cd2-bfeb-4318-a5fb-25d1b6fab042', 1],
  ['f354a3e7-8319-4a12-93f0-cd7bcb831269', 1],
  ['f5b5f46f-6d45-4cbf-af21-198f6fbe223e', 50],
  ['f673733c-ada0-4607-809d-296c292fc199', 150],
  ['f8bbe01d-bbb9-4068-b5a7-941a3280e305', 30],
  ['f8dcccc6-f816-406e-86be-98dfe493c875', 100],
  ['faef8cf9-db93-458a-9f01-1808376cd3b4', 1],
  ['fc9b5fb4-7783-485f-9fe6-a856de343344', 1],
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

  const gasPrice = ethers.utils.parseUnits('15', 'gwei');

  await nftAdmin.batchCreate(cids, datas, maxSupplys, {
    gasLimit: 6000000,
    gasPrice: gasPrice,
  });
  const id = await nft.id();
  console.log(id.toNumber());
  return true;
};

func.tags = ['CybertinoNFTV0_Partner_Migration', 'nft'];
func.id = '002';

export default func;
