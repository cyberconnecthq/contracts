import { InfluencerFactory } from '@typechain/InfluencerFactory';
import { encodeInitData } from './encode-init-data';

// signInfluencer with InfluencerV0 implementation
export const signInfluencer = async (
  influencerFactory: InfluencerFactory,
  influencerName: string,
  metaURL: string
) => {
  const data = await encodeInitData('InfluencerV0', 'Influencer_init', [
    influencerName,
    metaURL,
  ]);
  const proxy = await influencerFactory.signInfluencer(data);
  const resp = await proxy.wait();
  const addr = resp.events![0].address;
  return addr;
};
