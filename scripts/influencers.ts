import 'module-alias/register';
import { InfluencerFactory } from '@typechain/InfluencerFactory';
import fs from 'fs';
import { signInfluencer } from '@utils/sign-influencer';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  submitInfluencer,
  submitInfluencerBeaconProxy,
} from './etherscan-verify-proxy';

export interface influencerType {
  name: string;
  address: string;
  verified: boolean;
  initData: string;
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
  const { address: influencerAddr, initData } = await signInfluencer(
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

  // influencer beacon
  const beacon = await deployments.get('InfluencerBeacon');

  let verified = true;

  // submit etherscan for beacon proxy
  try {
    await submitInfluencerBeaconProxy(
      hre,
      influencerAddr,
      beacon.address,
      initData
    );

    // submit etherscan for proxy contract
    await submitInfluencer(hre, host, influencerAddr);
  } catch (e) {
    console.error(e);
    verified = false;
  }

  // write to json file
  influencers.set(name, {
    name,
    address: influencerAddr,
    verified: verified,
    initData: initData,
  });
  let newJSON: json = {};
  influencers.forEach((value, key) => {
    newJSON[key] = value;
  });
  const rstJSON = JSON.stringify(newJSON);

  fs.writeFileSync(`${dir}/${influencerFactoryAddress}.json`, rstJSON);
};

export const verifyInfluencer = async (
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
    throw 'No influencers signed';
  }

  const notVerifiedInfluencers: influencerType[] = [];

  influencers.forEach((v) => {
    if (!v.verified) {
      notVerifiedInfluencers.push(v);
    }
  });

  // influencer beacon
  const beacon = await deployments.get('InfluencerBeacon');

  for (let i = 0; i < notVerifiedInfluencers.length; i++) {
    const v = notVerifiedInfluencers[i];
    // submit etherscan for beacon proxy
    console.log('submit contract for address:', v.address);
    await submitInfluencerBeaconProxy(
      hre,
      v.address,
      beacon.address,
      v.initData
    );

    // submit etherscan for proxy contract
    await submitInfluencer(hre, host, v.address);
    influencers.set(v.name, {
      ...v,
      verified: true,
    });
  }

  let newJSON: json = {};
  influencers.forEach((value, key) => {
    newJSON[key] = value;
  });
  const rstJSON = JSON.stringify(newJSON);

  fs.writeFileSync(`${dir}/${influencerFactoryAddress}.json`, rstJSON);
};
