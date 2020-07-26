// @flow

import { getLocalVideoTrack } from '../../features/base/tracks';

import { BUNNY_EARS_DISABLED, BUNNY_EARS_ENABLED } from './actionTypes';
import { getBunnyEarsEffect } from './functions';

import logger from './logger';

/** 
* Signals that the local participant switches (enable or disable bunny ears effect filter).
*/



export function toggleBunnyEarsEffect(enabled: boolean) {
    return function(dispatch: (Object) => Object, getState: () => any) {
	const state = getState();
	
	if (state['features/bunny-ears'].bunnyEarsEnabled !== enabled) {
	    const { jitsiTrack } = getLocalVideoTrack(state['features/base/tracks']);

	    return getBunnyEarsEffect()
		.then(bunnyEarsEffectInstance =>
		    jitsiTrack.setEffect(enabled ? bunnyEarsEffectInstance : undefined)
			.then(() => {
			    enabled ? dispatch(bunnyEarsEnabled()) : dispatch(bunnyEarsDisabled());
			})
			.catch(error => {
			    enabled ? dispatch(bunnyEarsDisabled()) : dispatch(bunnyEarsEnabled());
			    logger.error('setEffect failed with error:', error);
			})
		)
		.catch(error => {
		    dispatch(bunnyEarsDisabled());
		    logger.error('getBunnyEarsEffect failed with error:', error);
		});
	}

	return Promise.resolve();
    };
}

/**
* Signals that the local participant has enabled the bunny ears effect.
*/
export function bunnyEarsEnabled() {
    return {
	    type: BUNNY_EARS_ENABLED
    };
}

/**
* Signals that the local participant has disabled the bunny ears effect.
*/
export function bunnyEarsDisabled() {
    return {
	    type: BUNNY_EARS_DISABLED
    };
}
