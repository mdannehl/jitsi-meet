// @flow

import React, { Component } from 'react';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { sendAnalytics, createToolbarEvent } from '../../analytics';
import { openDialog } from '../../base/dialog';

import VideoEffectFiltersDialog from './VideoEffectFiltersDialog';

import {
    AbstractButton,
    type AbstractButtonProps
} from '../../base/toolbox/components';

import { 
	Icon,
	IconVideoEffectFilters 
} from '../../base/icons'

/**
 * The type of the React {@code Component} props of
 * {@link VideoEffectFiltersMenuButton}.
 */
type Props = AbstractButtonProps & {
    
    /**
     * Callback to invoke when 
     * {@link OverflowMenuVideoEffectFiltersItem} is clicked.
     *
    onClick: Function,*/
    
    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
    
    /**
     * Invoked to obtain translated strings.
     
    t: Function*/

};

/**
 * Button toolbar menu that opens a dialog, so the participant can
 * activate one of the available video effect filters.
 *
 * @extends Component
 */
class VideoEffectFiltersMenuButton extends AbstractButton<Props, *> {	
	accessibilityLabel = 'toolbar.accessibilityLabel.videoEffectFilters';
	icon = IconVideoEffectFilters;
	label = 'toolbar.videoEffectFilters';
	
	/**
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     *
    render() {
        const { _selectedVideoEffectFilter } = this.props;
        const icon = VIDEO_EFFECT_FILTER_TO_ICON[_selectedVideoEffectFilter];
        console.log("Selected: ");
        console.log(_selectedVideoEffectFilter);
        console.log(icon);

        return (
            <VideoEffectFiltersButton
                buttonText = { t('toolbar.videoEffectFilters') }
                displayClass = { 'mutelink' }
                icon = { icon }
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }
    */
    _handleClick: () => void;

    /**
     * Handles clicking / pressing the button, and opens a dialog so 
     * that the participant can choose a video effect filter..
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { dispatch } = this.props;

        sendAnalytics(createToolbarEvent('video-effect-filters.openDialog'));
        dispatch(openDialog(VideoEffectFiltersDialog));
    }
    
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code OverflowMenuVideoEffectFiltersItem} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _audioOnly: boolean,
 *     _videoQuality: number
 * }}
 */
function _mapStateToProps(state) {
    return {
        _selectedVideoEffectFilter: state['features/video-effect-filters'].currentVideoEffectFilter
    };
}

export default translate(
    connect(_mapStateToProps)(VideoEffectFiltersMenuButton));
