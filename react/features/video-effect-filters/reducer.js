import { ReducerRegistry } from '../base/redux';

import { BUNNY_EARS_ENABLED, POI_FILTER_ENABLED, VIDEO_EFFECT_FILTERS_DISABLED} from './actionTypes';

ReducerRegistry.register('features/video-effect-filters', (state = {}, action) => {

    switch (action.type) {
    case BUNNY_EARS_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: BUNNY_EARS_ENABLED
	};
    }
    case POI_FILTER_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: POI_FILTER_ENABLED
	};
    }
    case VIDEO_EFFECT_FILTERS_DISABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: VIDEO_EFFECT_FILTERS_DISABLED
	};
    }
    }

    return state;
});
