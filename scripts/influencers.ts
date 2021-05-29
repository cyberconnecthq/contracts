import 'module-alias/register';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { InfluencerFactory } from '@typechain/InfluencerFactory';
import { signInfluencer } from '@utils/sign-influencer';

async function main() {
  const dep = await deployments.get('InfluencerFactory');
  let influencerFactory = (await ethers.getContractAt(
    dep.abi,
    dep.address
  )) as InfluencerFactory;
  const influencerName = 'Cybertino';
  const influencerNameEncoded = 'cybertino';
  const metaURL = `https://api.cybertino.io/canvas/${influencerNameEncoded}/`;
  const resp = await signInfluencer(influencerFactory, influencerName, metaURL);
  const { deployer } = await getNamedAccounts();
  await influencerFactory.grantManagerRole(deployer, resp);
  console.log('influencer addr', resp);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
