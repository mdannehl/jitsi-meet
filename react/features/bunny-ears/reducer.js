import { ReducerRegistry } from '../base/redux';

import { BUNNY_EARS_ENABLED, BUNNY_EARS_DISABLED } from './actionTypes';

ReducerRegistry.register('features/bunny-ears', (state = {}, action) => {

    switch (action.type) {
    case BUNNY_EARS_ENABLED: {
	return {
	    ...state,
	    bunnyEarsEnabled: true
	};
    }
    case BUNNY_EARS_DISABLED: {
	return {
	    ...state,
	    bunnyEarsEnabled: false
	};
    }
    }

    return state;
});
