import 'module-alias/register';
import { expect, use } from 'chai';
import { Account, getAccounts } from '@utils/index';
import {
  InfluencerV0,
  InfluencerFactory,
  InfluencerBeacon,
} from '@typechain/index';
import { ethers, waffle } from 'hardhat';
import Influencer from '@artifacts/contracts/Influencer/InfluencerV0.sol/InfluencerV0.json';
import { Contract } from 'ethers';

// use(solidity);

describe('Manager', () => {
  let owner: Account;
  let user1: Account;
  let user2: Account;
  let mgr: InfluencerFactory;
  let influencer: InfluencerV0;
  let beacon: InfluencerBeacon;
  const provider = waffle.provider;

  beforeEach(async () => {
    [owner, user1, user2] = await getAccounts();
    const influencerFactory = await ethers.getContractFactory('InfluencerV0');
    influencer = await influencerFactory.deploy();

    const beaconFactory = await ethers.getContractFactory('InfluencerBeacon');
    beacon = await beaconFactory.deploy(influencer.address);

    const mgrFactory = await ethers.getContractFactory('InfluencerFactory');
    mgr = await mgrFactory.deploy(beacon.address);
  });

  const sign = async (name: string, uri: string) => {
    const proxy = await mgr.signInfluencer(name, uri);
    const resp = await proxy.wait();
    const addr = resp.events![0].address;

    return new Contract(
      addr,
      JSON.stringify(Influencer.abi),
      provider
    ) as InfluencerV0;
  };

  context('sign multiple influencer', async () => {
    const name1: string = 'KIM KARDASHIAN';
    const uri1: string = 'https://api.cybertino.io/kim/{id}';
    let influencerProxy1: Contract;

    const name2: string = 'HUSKYO';
    const uri2: string = 'https://api.cybertino.io/husko/{id}';
    let influencerProxy2: Contract;

    beforeEach(async () => {
      influencerProxy1 = await sign(name1, uri1);
      influencerProxy2 = await sign(name2, uri2);
    });

    it('beacon address implementation not changed', async () => {
      expect(await beacon.implementation()).to.eq(influencer.address);
    });

    it('beacon address not changed', async () => {
      expect(await mgr.beacon()).to.eq(beacon.address);
    });

    context('influencer 1', async () => {
      it('has correct creator name', async () => {
        expect(await influencerProxy1.name()).to.eq(name1);
      });

      it('has correct base uri', async () => {
        expect(await influencerProxy1.uri(0)).to.eq(uri1);
      });
    });

    context('influencer 2', async () => {
      it('has correct creator name', async () => {
        expect(await influencerProxy2.name()).to.eq(name2);
      });

      it('has correct base uri', async () => {
        expect(await influencerProxy2.uri(0)).to.eq(uri2);
      });
    });
  });
});
