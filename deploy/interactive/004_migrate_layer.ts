import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CMCLayerV0, MockAggregator } from '@typechain/index';
import { getAccounts, getContract } from '@utils/index';

const legendary = [
  'QmPEL4fDoZ2a7gmryTU92J7FUEbfNRUPfSC5JfXasH1sZs',
  'QmYX7PHkFY73afwyn4kz5QkaVZiJRekCS8NsXHcDFAGfKP',
  'QmS8eStvKHRvuCVR55G46zMESbJQ5CQ58szWSdpRs92Xnt',
];

const special = [
  'Qme9RyB7aTdXhxCK7yAVg588wMiKRUHiQzqaLmwi17WBd6',
  'QmZrnQKh8hsFjFv1nJMuDm121gNoT9Zx36L174jPVY5Hm1',
  'QmX5VztgBdoL31vaqzdd8bge9LfqSG8CymNXv1yb8bbaPy',
];

const epic = [
  'QmVsuwgEbFwksceuDMBxPAAYVoAQtLzH3414qxiAJG2uVm',
  'Qmbru1LzJ6LqfznJ8YASWsZdqXNxLh9iyvz3qQr5miEFC8',
  'QmaMhxCnvDsBMREadcKTqwfwtvZqKVZH6uoB3TLFnMMGtk',
];

const rare = [
  'QmcX7L3B9pxiTPVHq8kgn1aW4FTuVYUb8CLAMM7aQR56oL',
  'QmPzZU5L3zLwvroaQwWnGPbGYYnY9aetHS9VF18PmUb9ix',
  'QmRjoiym3ESGxmCLYVdNrGUvKq7Wceg4oqr6eKUziXFMyw',
];

const common = [
  'QmNoupcPZ2WXs5rRaHbge599ZbWnMsx7LDBxExzgh9rt2e',
  'QmSG3t42xsxZxSvMuWu479289ifwpMbDEoEvfEvgLbYhZe',
  'QmVJ1LjFErb5CR7zXYAeaQBz4FHrABT6MpZhNTdE4EFTLS',
];

const layers = [legendary, special, epic, rare, common];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const [deployer, admin] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let CMCLayer = await deployments.get('CMCLayerV0');
  const layer: CMCLayerV0 = await getContract(CMCLayer);
  const layerAdmin: CMCLayerV0 = layer.connect(admin.wallet);
  for (let i = 0; i < layers.length; i++) {
    layerAdmin.create(admin.address, layers[i], 0, '0x');
  }

  return true;
};

export default func;
func.tags = ['CMCLayerMigrate', 'interactive'];
func.dependencies = ['CMCLayerV0'];
func.id = '001_CMCLayerMigrate';
