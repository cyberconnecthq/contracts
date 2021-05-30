import 'module-alias/register';
import { InfluencerFactory } from '@typechain/InfluencerFactory';
import fs from 'fs';
import { signInfluencer } from '@utils/sign-influencer';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { submitInfluencer } from './etherscan-verify-proxy';

interface influencerType {
  name: string;
  address: string;
}

interface json {
  [key: string]: influencerType;
}

export const sign = async (
  name: string,
  host: string,
  networkName: string,
  hre: HardhatRuntimeEnvironment
) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  // check if duplicate
  const influencersJSON = require(`../influencers/${networkName}/influencers.json`);
  // const influencers = new Map<string, influencerType>(
  //   JSON.parse(influencersJSON)
  // );
  const influencers = new Map<string, influencerType>();
  for (let value in influencersJSON) {
    influencers.set(value, influencersJSON[value]);
  }
  if (influencers.has(name)) {
    throw new Error('Influencer already signed');
  }

  // sign
  const dep = await deployments.get('InfluencerFactory');
  let influencerFactory = (await ethers.getContractAt(
    dep.abi,
    dep.address
  )) as InfluencerFactory;
  const metaURL = `https://api.cybertino.io/metadata/canvas/${name}/`;
  const resp = await signInfluencer(influencerFactory, name, metaURL, hre);
  const { admin } = await getNamedAccounts();
  await influencerFactory.grantManagerRole(admin, resp);

  // submit ether scan

  // submit ether proxy
  console.log('-----------------');
  await submitInfluencer(host, resp);
  console.log('-----------------');

  // write to json file
  influencers.set(name, {
    name,
    address: resp,
  });
  let newJSON: json = {};
  influencers.forEach((value, key) => {
    newJSON[key] = value;
  });
  const rstJSON = JSON.stringify(newJSON);
  const dir = `influencers/${networkName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(`${dir}/influencers.json`, rstJSON);
};
