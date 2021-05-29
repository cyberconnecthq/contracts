import 'module-alias/register';
import { expect } from './chai-setup';
import { utils } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { InfluencerV0 } from '@typechain/index';
import { Account, getAccounts } from '@utils/index';

describe('Influencer', () => {
  let influencer: InfluencerV0;
  let owner: Account;
  let user1: Account;
  let user2: Account;
  const influencerName: string = 'KIM KARDASHIAN';
  const uri: string = 'https://api.cybertino.io/{id}';
  const managerRole = utils.id('MANAGER_ROLE');
  const adminRole =
    '0x0000000000000000000000000000000000000000000000000000000000000000';
  const ZERO_DATA = '0x';
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  let influencerU1: InfluencerV0;

  before(async () => {
    [owner, user1, user2] = await getAccounts();
    const { InfluencerV0 } = await deployments.fixture(['InfluencerV0']);
    influencer = (await ethers.getContractAt(
      InfluencerV0.abi,
      InfluencerV0.address
    )) as InfluencerV0;

    influencerU1 = influencer.connect(user1.wallet);
    await influencer.Influencer_init(influencerName, uri);
  });

  describe('basic', async () => {
    it('has correct creator name', async () => {
      expect(await influencer.name()).to.eq(influencerName);
    });

    it('has correct base uri', async () => {
      expect(await influencer.uri(0)).to.eq(uri);
    });
  });

  describe('access control', async () => {
    it('owner has admin role', async () => {
      expect(await influencer.hasRole(adminRole, owner.address)).to.be.true;
    });

    it('owner has manager role', async () => {
      expect(await influencer.hasRole(managerRole, owner.address)).to.be.true;
    });

    it('other does not have admin role', async () => {
      expect(await influencer.hasRole(adminRole, user1.address)).to.be.false;
    });

    it('other does not have manager role', async () => {
      expect(await influencer.hasRole(managerRole, user1.address)).to.be.false;
    });

    it('owner can grant/revoke other manager role', async () => {
      await expect(influencer.grantManagerRole(user1.address))
        .to.emit(influencer, 'RoleGranted')
        .withArgs(managerRole, user1.address, owner.address);

      expect(await influencer.hasRole(managerRole, user1.address)).to.be.true;

      await expect(influencer.revokeRole(managerRole, user1.address))
        .to.emit(influencer, 'RoleRevoked')
        .withArgs(managerRole, user1.address, owner.address);

      expect(await influencer.hasRole(managerRole, user1.address)).to.be.false;
    });

    it('other cannot grant/revoke other manager role', async () => {
      await expect(influencerU1.grantManagerRole(user1.address)).to.reverted;

      await expect(influencerU1.revokeRole(managerRole, user1.address)).to
        .reverted;
    });

    describe('createCanvas', async () => {
      describe('with manager role', async () => {
        it('can create new canvas', async () => {
          const canvasID = 0;
          const amount = 1;
          const tokens = [
            {
              layer: ZERO_ADDRESS,
              layerID: 0,
            },
          ];
          await expect(
            influencer.createCanvas(user1.address, tokens, 1, ZERO_DATA)
          )
            .to.emit(influencer, 'TransferSingle')
            .withArgs(
              owner.address,
              ZERO_ADDRESS,
              user1.address,
              canvasID,
              amount
            )
            .to.emit(influencer, 'CanvasCreated');
          // .withArgs(canvasID, tokens); // doesn't seem like the test can match with struct value
          expect(await influencer.canvasCount()).to.eq(1);
        });
      });
    });
  });
});
