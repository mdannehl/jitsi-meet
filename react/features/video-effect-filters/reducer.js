import { ReducerRegistry } from '../base/redux';

import { 
	BLUR_ENABLED,
	BUNNY_EARS_ENABLED, 
	POI_FILTER_GREY_ENABLED,
	POI_FILTER_RED_ENABLED,
	POI_FILTER_YELLOW_ENABLED,
	VIDEO_EFFECT_FILTERS_DISABLED 
} from './actionTypes';

ReducerRegistry.register('features/video-effect-filters', (state = {}, action) => {

    switch (action.type) {
	case BLUR_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: BLUR_ENABLED
	};
    }
    case BUNNY_EARS_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: BUNNY_EARS_ENABLED
	};
    }
    case POI_FILTER_GREY_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: POI_FILTER_GREY_ENABLED
	};
    }
    case POI_FILTER_RED_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: POI_FILTER_RED_ENABLED
	};
    }
    case POI_FILTER_YELLOW_ENABLED: {
	return {
	    ...state,
	    currentVideoEffectFilter: POI_FILTER_YELLOW_ENABLED
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
