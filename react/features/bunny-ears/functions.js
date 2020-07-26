import { getJitsiMeetGlobalNS, loadScript } from '../base/util';

/**
* Returns promise that resolves with the bunny ears effect instance.
*/
export function getBunnyEarsEffect() {
    const ns = getJitsiMeetGlobalNS();

    if (ns.effects && ns.effects.createBunnyEarsEffect) {
	return ns.effects.createBunnyEarsEffect();
    }

    return loadScript('libs/video-bunny-ears-effect.min.js').then(() => ns.effects.createBunnyEarsEffect());
}
