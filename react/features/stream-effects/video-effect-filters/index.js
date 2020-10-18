import JitsiStreamVideoEffectFilters from './JitsiStreamVideoEffectFilters';
//import * as bodyPix from '@tensorflow-models/body-pix';

var effectInstance;

/**
* Returns an instance of JitsiStreamBunnyEarsEffect and loads a bodyPix 
* model for person segmantation.
*/
export async function getOrCreateVideoEffectFiltersInstance(effect) {
	if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
		throw new Error('JitsiStreamVideoEffectFilters not supported!');
	}
	
	if (effectInstance) {
		effectInstance.setSelectedVideoEffectFilter(effect);
	} else {
		
		effectInstance = new JitsiStreamVideoEffectFilters(effect);		
	}
	
	return effectInstance;
}

