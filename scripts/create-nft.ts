import 'module-alias/register';
import { ethers, deployments } from 'hardhat';
import { CybertinoNFTV0 } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

const tokens = [
  ['16d572fb-cee3-4dff-96bb-fc9990a02a90', 20],
  ['27f91521-38f9-4dcd-b0d8-50b65f438cbe', 3],
  ['2a888736-2d55-45a3-b74e-4fe92ac22d22', 30],
  ['3c6b3fd6-b23e-42e6-b4f8-700c2119a0b3', 3],
  ['41df14aa-10c5-4bd7-be89-62f3173a5599', 30],
  ['4701a448-b2e4-4e2f-aec0-51578aa0e0de', 30],
  ['5ce1ec33-e56f-40ef-ad49-715a33b03e74', 2],
  ['64d5acd5-375b-4aec-96cf-500f09d83d93', 30],
  ['6a101bf2-3f41-4b49-8b5c-d37152fd77a3', 10],
  ['6ae952f9-b28e-497c-b189-00dc2fd94aca', 30],
  ['932b3c0d-c390-45df-b507-3b00dab18891', 30],
  ['a6dda7c1-16fc-47fc-944e-7d6442467a31', 100],
  ['b57f2c84-b220-424b-812f-704bf06efe00', 10],
  ['df18deb2-fa76-458b-a986-59e7a88933f2', 101],
  ['f6815c48-6c69-43e9-a92c-95f9be586af5', 30],
];

const main = async () => {
  let dep = await deployments.get('CybertinoNFTV0');

  const [deployer, admin, platformSigner] = await getAccounts();
  const nft = await getContract(dep);
  const nftAdmin = nft.connect(admin.wallet);
  const nftPlatform = nft.connect(platformSigner.wallet);
  for (let i = 0; i < tokens.length; i++) {
    await nftAdmin.create(tokens[i][0], '0x', tokens[i][1]);
  }
  console.log(await nft.id());
};
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
