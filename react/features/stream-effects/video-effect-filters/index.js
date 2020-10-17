import * as bodyPix from '@tensorflow-models/body-pix';
import JitsiStreamVideoEffectFilters from './JitsiStreamVideoEffectFilters';

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
		// Output stride of 16 and a multiplier of 0.5 (same as blur effect suggests).
		const bpModel = await bodyPix.load({
			architecture: 'MobileNetV1',
			outputStride: 16,
			multiplier: 0.5,
			quantBytes: 2
		});

		effectInstance = new JitsiStreamVideoEffectFilters(bpModel, effect);		
	}
	
	return effectInstance;
}

