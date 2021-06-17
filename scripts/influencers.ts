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
  const influencerFactoryJSON = require(`../deployments/${networkName}/InfluencerFactory.json`);
  const influencerFactoryAddress = influencerFactoryJSON.address;
  // check if duplicate
  const dir = `influencers/${networkName}`;
  const influencers = new Map<string, influencerType>();
  try {
    const influencersJSON = require(`../influencers/${networkName}/${influencerFactoryAddress}.json`);
    for (let value in influencersJSON) {
      influencers.set(value, influencersJSON[value]);
    }
  } catch (e) {
    // no influencers have been signed
    // create network folder if not existent
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
  const influencerAddr = await signInfluencer(
    influencerFactory,
    name,
    metaURL,
    hre
  );
  const { admin } = await getNamedAccounts();
  await influencerFactory.grantManagerRole(admin, influencerAddr);
  console.log(
    `new influencer signed at ${influencerAddr}, manager address is :${admin}`
  );

  // submit etherscan for beacon proxy
  await submitInfluencerBeaconProxy(host);

  // submit etherscan for proxy contract
  await submitInfluencer(host, influencerAddr);

  // write to json file
  influencers.set(name, {
    name,
    address: influencerAddr,
  });
  let newJSON: json = {};
  influencers.forEach((value, key) => {
    newJSON[key] = value;
  });
  const rstJSON = JSON.stringify(newJSON);

  fs.writeFileSync(`${dir}/${influencerFactoryAddress}.json`, rstJSON);
};
