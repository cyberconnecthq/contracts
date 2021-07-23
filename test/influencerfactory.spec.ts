import 'module-alias/register';
import { expect } from './chai-setup';
import { Account, getAccounts } from '@utils/index';
import {
  InfluencerV0,
  InfluencerFactory,
  InfluencerBeacon,
  TestingInfluencerV1,
} from '@typechain/index';
import { ethers, deployments } from 'hardhat';
import hardhat from 'hardhat';
import InfluencerV1Json from '@artifacts/contracts/__testing__/testing__InfluencerV1.sol/__testing__InfluencerV1.json';
import { signInfluencer } from '@utils/sign-influencer';

describe('Manager', () => {
  let owner: Account;
  let user1: Account;
  let user2: Account;
  let mgr: InfluencerFactory;
  let influencer: InfluencerV0;
  let beacon: InfluencerBeacon;
  let influencerAbi: any[];

  before(async () => {
    [owner, user1, user2] = await getAccounts();
    const { InfluencerFactory, InfluencerBeacon, InfluencerV0 } =
      await deployments.fixture(['InfluencerFactory']);
    mgr = (await ethers.getContractAt(
      InfluencerFactory.abi,
      InfluencerFactory.address
    )) as InfluencerFactory;
    influencer = (await ethers.getContractAt(
      InfluencerV0.abi,
      InfluencerV0.address
    )) as InfluencerV0;
    beacon = (await ethers.getContractAt(
      InfluencerBeacon.abi,
      InfluencerBeacon.address
    )) as InfluencerBeacon;
    influencerAbi = InfluencerV0.abi;
  });

  const sign = async (name: string, uri: string) => {
    const { address } = await signInfluencer(mgr, name, uri, hardhat);
    return proxyContract(address);
  };

  const proxyContract = (addr: string) => {
    return ethers.getContractAt(influencerAbi, addr) as Promise<InfluencerV0>;
  };

  describe('sign multiple influencer', async () => {
    const name1 = 'KIM KARDASHIAN';
    const uri1 = 'https://api.cybertino.io/kim/{id}';
    let influencerProxy1: InfluencerV0;
    const name1new = 'newName';

    const name2 = 'HUSKYO';
    const uri2 = 'https://api.cybertino.io/husko/{id}';
    let influencerProxy2: InfluencerV0;

    before(async () => {
      influencerProxy1 = await sign(name1, uri1);
      influencerProxy2 = await sign(name2, uri2);
    });

    it('beacon address implementation not changed', async () => {
      expect(await beacon.implementation()).to.eq(influencer.address);
    });

    it('beacon address not changed', async () => {
      expect(await mgr.beacon()).to.eq(beacon.address);
    });

    it('manager roles should be given to factory first', async () => {
      expect(
        await influencerProxy1.hasRole(
          await influencerProxy1.MANAGER_ROLE(),
          mgr.address
        )
      ).to.be.true;
    });

    it('grant manager role', async () => {
      const managerRole = await influencerProxy1.MANAGER_ROLE();

      // grant influencer 1
      await expect(
        mgr.grantManagerRole(owner.address, influencerProxy1.address)
      )
        .to.emit(influencerProxy1, 'RoleGranted')
        .withArgs(managerRole, owner.address, mgr.address);
      expect(
        await influencerProxy1.hasRole(
          await influencerProxy1.MANAGER_ROLE(),
          mgr.address
        )
      ).to.be.true;
      expect(
        await influencerProxy1.hasRole(
          await influencerProxy1.MANAGER_ROLE(),
          owner.address
        )
      ).to.be.true;

      // grant influencer 2
      await expect(
        mgr.grantManagerRole(owner.address, influencerProxy2.address)
      )
        .to.emit(influencerProxy2, 'RoleGranted')
        .withArgs(managerRole, owner.address, mgr.address);
      expect(
        await influencerProxy2.hasRole(
          await influencerProxy2.MANAGER_ROLE(),
          mgr.address
        )
      ).to.be.true;
      expect(
        await influencerProxy2.hasRole(
          await influencerProxy2.MANAGER_ROLE(),
          owner.address
        )
      ).to.be.true;
    });

    describe('influencer 1', async () => {
      it('has correct creator name', async () => {
        expect(await influencerProxy1.name()).to.eq(name1);
      });

      it('has correct base uri', async () => {
        expect(await influencerProxy1.uri(0)).to.eq(uri1);
      });

      it('set name should change name', async () => {
        await influencerProxy1.setName(name1new);
        expect(await influencerProxy1.name()).to.eq(name1new);
      });
    });

    describe('influencer 2', async () => {
      it('has correct creator name', async () => {
        expect(await influencerProxy2.name()).to.eq(name2);
      });

      it('has correct base uri', async () => {
        expect(await influencerProxy2.uri(0)).to.eq(uri2);
      });
    });

    describe('upgrade', async () => {
      const nickname1 = 'kimmy';
      const nickname2 = 'huskyooo';
      let influencerProxy1V1: TestingInfluencerV1;
      let influencerProxy2V1: TestingInfluencerV1;

      const proxyContractV1 = (addr: string) => {
        return ethers.getContractAt(
          InfluencerV1Json.abi,
          addr
        ) as Promise<TestingInfluencerV1>;
      };

      before(async () => {
        const InfluencerV1Factory = await ethers.getContractFactory(
          '__testing__InfluencerV1'
        );
        const influencerV1 = await InfluencerV1Factory.deploy();

        await expect(beacon.upgradeTo(influencerV1.address))
          .to.emit(beacon, 'Upgraded')
          .withArgs(influencerV1.address);
        influencerProxy1V1 = await proxyContractV1(influencerProxy1.address);

        await influencerProxy1V1.setNickname(nickname1);

        influencerProxy2V1 = await proxyContractV1(influencerProxy2.address);
        await influencerProxy2V1.setNickname(nickname2);
      });

      describe('influencer 1', async () => {
        it('has correct creator name', async () => {
          expect(await influencerProxy1V1.name()).to.eq(name1new);
        });

        it('has correct base uri', async () => {
          expect(await influencerProxy1V1.uri(0)).to.eq(uri1);
        });

        it('has empty nickname', async () => {
          expect(await influencerProxy1V1.nickname()).to.eq(nickname1);
        });
      });

      describe('influencer 2', async () => {
        it('has correct creator name', async () => {
          expect(await influencerProxy2V1.name()).to.eq(name2);
        });

        it('has correct base uri', async () => {
          expect(await influencerProxy2V1.uri(0)).to.eq(uri2);
        });

        it('has empty nickname', async () => {
          expect(await influencerProxy2V1.nickname()).to.eq(nickname2);
        });
      });
    });
  });
});
