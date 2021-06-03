import 'module-alias/register';
import { expect } from './chai-setup';
import { ethers, deployments } from 'hardhat';
import { LayerProxy, LayerV0, TestingLayerV1Inheritance, TestingLayerV1Struct } from '@typechain/index';
import LayerV1SJson from '@artifacts/contracts/__testing__/testing__LayerV1_Struct.sol/__testing__LayerV1_Struct.json';
import LayerV1IJson from '@artifacts/contracts/__testing__/testing__LayerV1_Inheritance.sol/__testing__LayerV1_Inheritance.json';
import { Account, getAccounts } from '@utils/index';

describe('Layer Proxy contract', () => {
  let proxy: LayerV0;
  let layerProxy: LayerProxy;
  let layer: LayerV0;
  let proxyOwner: LayerV0;
  let proxyUser: LayerV0;
  let deployer: Account;
  let owner: Account;
  let user: Account;
  const data = '0x';
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  before(async () => {
    [deployer, owner, user] = await getAccounts();
    // after fixture, owner is transferred already
    const { LayerProxy: lp, LayerV0: layerV0 } = await deployments.fixture([
      'LayerProxy',
    ]);
    layer = (await ethers.getContractAt(
      layerV0.abi,
      layerV0.address
    )) as LayerV0;
    proxy = (await ethers.getContractAt(layerV0.abi, lp.address)) as LayerV0;
    layerProxy = (await ethers.getContractAt(lp.abi, lp.address)) as LayerProxy;
    proxyOwner = proxy.connect(owner.wallet);
    proxyUser = proxy.connect(user.wallet);
  });

  describe('proxy basic', async () => {
    it('deployer cannot call proxy impl', async () => {
      expect(proxy.name()).to.be.revertedWith(
        'admin cannot fallback to proxy target'
      );
    });
  });

  describe('layer basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await proxyOwner.name()).to.eq('cybertino_layer');
      expect(await proxyOwner.symbol()).to.eq('LAYER');
    });

    it('has correct baseURI', async () => {
      await proxyOwner.mintLayer(deployer.address, data, 1, 0);
      expect(await proxyOwner.tokenURI(0)).to.eq(
        'https://api.cybertino.io/metadata/layer/0'
      );
    });
  });

  describe('owner only', async () => {
    it('deployer is no longer owner', async () => {
      expect(
        proxyUser.mintLayer(deployer.address, data, 1, 0)
      ).to.be.revertedWith('caller is not the owner');
    });
  });

  describe('upgrade implementation', async () => {
    describe('layer struct', async () => {
      const tokenID = 1;
      const maxState = 10;
      const currentState = 8;
      before(async () => {
        // populate data in layerv0
        await expect(
          proxyOwner.mintLayer(user.address, data, maxState, currentState)
        )
          .to.emit(proxyOwner, 'Transfer')
          .withArgs(zeroAddr, user.address, tokenID);
      });

      context("upgrade to LayerV1_Struct", async () => {
        let layerSProxyAdmin: TestingLayerV1Struct;

        before(async () => {
          const LayerS = await ethers.getContractFactory(
            '__testing__LayerV1_Struct'
          );
          const layerS = await LayerS.deploy();
  
          await expect(layerProxy.upgradeTo(layerS.address))
            .to.emit(layerProxy, 'Upgraded')
            .withArgs(layerS.address);
  
          const layerSProxy = (await ethers.getContractAt(
            LayerV1SJson.abi,
            layerProxy.address
          )) as TestingLayerV1Struct;
          layerSProxyAdmin = layerSProxy.connect(owner.wallet);
        });

        it('preserves data before upgrade', async () => {
          expect(await layerSProxyAdmin.balanceOf(user.address)).to.eq(1);
        });

        it('has correct zero value for previouse layer', async () => {
          const {maxState: max, currenctState: cur, positionX: posX, positionY: poxY} = await layerSProxyAdmin.getLayer(tokenID);
          expect(maxState).to.eq(max);
          expect(currentState).to.eq(cur);
          expect(posX).to.eq(0);
          expect(poxY).to.eq(0);
        })

        context("mint new layer", async () => {
          const max = 20;
          const cur = 12;
          const posX = 3;
          const poxY = 5;
          const newTokenID = 2;

          before(async () => {
            await expect(
              layerSProxyAdmin.mintLayer(user.address, "0x", max, cur, posX, poxY)
            )
              .to.emit(proxyOwner, 'Transfer')
              .withArgs(zeroAddr, user.address, newTokenID);
          })

          it('has correct layer info', async () => {
            const {maxState, currenctState, positionX, positionY} = await layerSProxyAdmin.getLayer(newTokenID);
            expect(maxState).to.eq(max);
            expect(currenctState).to.eq(cur);
            expect(positionX).to.eq(posX);
            expect(positionY).to.eq(poxY);
          });
          
          it('prev token has correct layer info', async () => {
            const {maxState: max, currenctState: cur, positionX: posX, positionY: poxY} = await layerSProxyAdmin.getLayer(tokenID);
          expect(maxState).to.eq(max);
          expect(currentState).to.eq(cur);
          expect(posX).to.eq(0);
          expect(poxY).to.eq(0);
          });
        })
      })
    });

    describe('layer inheritance', async () => {
      context("upgrade to LayerV1_Inheritance", async () => {
        let layerIProxyAdmin: TestingLayerV1Inheritance;

        before(async () => {
          const LayerI = await ethers.getContractFactory(
            '__testing__LayerV1_Inheritance'
          );
          const layerI = await LayerI.deploy();
  
          await expect(layerProxy.upgradeTo(layerI.address))
            .to.emit(layerProxy, 'Upgraded')
            .withArgs(layerI.address);
  
          const layerSProxy = (await ethers.getContractAt(
            LayerV1IJson.abi,
            layerProxy.address
          )) as TestingLayerV1Inheritance;
          layerIProxyAdmin = layerSProxy.connect(owner.wallet);
        });

        it('has empty nickname', async () => {
          expect(await layerIProxyAdmin.nickname()).to.eq("");
        });

        it('can set nickname', async () => {
          const nickname = "huskyo";
          await layerIProxyAdmin.setNickname(nickname);
          expect(await layerIProxyAdmin.nickname()).to.eq(nickname);
        });
      });
    });
  });
});
