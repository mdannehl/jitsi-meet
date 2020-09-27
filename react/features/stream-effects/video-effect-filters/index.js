import * as bodyPix from '@tensorflow-models/body-pix';
import JitsiStreamVideoEffectFilters from './JitsiStreamVideoEffectFilters';

/**
* Creates new instance of JitsiStreamBunnyEarsEffect and loads bodyPix model 
* for person segmantation.
*/
export async function getOrCreateVideoEffectFiltersInstance(effect) {
	if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
		throw new Error('JitsiStreamVideoEffectFilters not supported!');
	}

	// Output stride of 16 and a multiplier of 0.5 (same as blur effect suggests).
	const bpModel = await bodyPix.load({
		architecture: 'MobileNetV1',
		outputStride: 16,
		multiplier: 0.5,
		quantBytes: 2
	});

	return new JitsiStreamVideoEffectFilters(bpModel, effect);
}

