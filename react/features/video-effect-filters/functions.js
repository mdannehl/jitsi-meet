import { getJitsiMeetGlobalNS, loadScript } from '../base/util';

var effectInstance;

/**
* Returns promise that resolves with instance of the video effect 
* filters. All effects (e.g. bunny ears) are available in this instance.
*/
export function getVideoEffectFiltersInstance(effect) {
    const ns = getJitsiMeetGlobalNS();
	
	if (effectInstance) {
		return effectInstance;
	}

    if (ns.effects && ns.effects.getOrCreateVideoEffectFiltersInstance) {
		effectInstance = ns.effects.getOrCreateVideoEffectFiltersInstance(effect);
		return effectInstance;
    }

    effectInstance = loadScript('libs/video-effect-filters.min.js').then(() => ns.effects.getOrCreateVideoEffectFiltersInstance(effect));
    return effectInstance;
}
