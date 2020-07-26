// @flow

import React from 'react';

import { createVideoBunnyEarsEvent, sendAnalytics } from '../../analytics';
import { translate } from '../../base/i18n';
import { IconBunnyEars } from '../../base/icons';
import { connect } from '../../base/redux';
import { AbstractButton, BetaTag } from '../../base/toolbox';
import type { AbstractButtonProps } from '../../base/toolbox';
import { toggleBunnyEarsEffect } from '../actions';

/**
* React component props of the VideoBunnyEarsButton.
*/
type Props = AbstractButtonProps & {

    _isVideoBunnyEarsEnabled: boolean;

    /**
    * Redux dispatch function
    */
    dispatch: Function

};

/**
* Abstract implementation of a button that toggles the bunny ears effect.
*/
class VideoBunnyEarsButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.videobunnyears';
    icon = IconBunnyEars;
    label = 'toolbar.startvideobunnyears';
    tooltip = 'toolbar.startvideobunnyears';
    toggledLabel = 'toolbar.stopvideobunnyears';

    /**
    * Helper function to add a Beta Tag React Element at the end of the button.
    */
	_getElementAfter() {
		return <BetaTag />;
	}

	/**
	* Handle the button click by starting and stopping the bunny ears effect
	* by toggling the redux state.
	*/
	_handleClick() {
		const { _isVideoBunnyEarsEnabled, dispatch} = this.props;
		const newValue = !_isVideoBunnyEarsEnabled;

		sendAnalytics(createVideoBunnyEarsEvent(newValue ? 'started' : 'stopped'));
		dispatch(toggleBunnyEarsEffect(newValue));
	}

	/**
	* Returns boolean value if the bunny ears effect is enabled or not.
	*/
	_isToggled() {
		return this.props._isVideoBunnyEarsEnabled;
	}
}

/**
* Maps (parts of) the redux state to the associated props for 
* the VideoBunnyEarsButton component.
*/
function _mapStateToProps(state): Object {
	return {
		_isVideoBunnyEarsEnabled: Boolean(state['features/bunny-ears'].bunnyEarsEnabled)
	};
}

export default translate(connect(_mapStateToProps)(VideoBunnyEarsButton));
