import 'module-alias/register';
import { ethers, deployments } from 'hardhat';
import { InfluencerFactory } from 'typechain/InfluencerFactory';

async function main() {
  const dep = await deployments.get('InfluencerFactory');
  let influencerFactory = (await ethers.getContractAt(
    dep.abi,
    dep.address
  )) as InfluencerFactory;
  const influencerName = 'Cybertino';
  const influencerNameURL = 'cybertino';
  const resp = await signInfluencer(
    influencerFactory,
    influencerName,
    influencerNameURL
  );
  console.log(resp);
}

const signInfluencer = async (
  influencerFactory: InfluencerFactory,
  influencerName: string,
  influencerNameURL: string
) => {
  const metaurl = `https://api.cybertino.io/canvas/${influencerNameURL}/`;
  const proxy = await influencerFactory.signInfluencer(influencerName, metaurl);
  const resp = await proxy.wait();
  return resp.events![0].address;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
