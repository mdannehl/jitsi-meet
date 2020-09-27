// @flow

import * as bodyPix from '@tensorflow-models/body-pix';
import {
    CLEAR_INTERVAL,
    INTERVAL_TIMEOUT,
    SET_INTERVAL,
    timerWorkerScript
} from './TimerWorker';

import {
	BUNNY_EARS_ENABLED,
	POI_FILTER_ENABLED,
	VIDEO_EFFECT_FILTERS_DISABLED
} from '../../video-effect-filters/actionTypes';

/**
 * Represents a modified MediaStream that adds funny effect filters to 
 * the video. 
 * This class does the processing of the original video stream.
 */
export default class JitsiStreamVideoEffectFilters {
    _bpModel: Object;
    _inputVideoElement: HTMLVideoElement;
    _onMaskFrameTimer: Function;
    _maskFrameTimerWorker: Worker;
    _maskInProgress: boolean;
    _outputCanvasElement: HTMLCanvasElement;
    _outputCanvasElementContext : CanvasRenderingContext2D;
    _renderMask: Function;
    _segmentationData: Object;
    _nextSegmentationDataReady: boolean;
    _selectedVideoEffectFilter: String;
    isEnabled: Function;
    startEffect: Function;
    stopEffect: Function;
    

    /**
     * Represents a modified video MediaStream track.
     *
     * @class
     * @param {BodyPix} bpModel - BodyPix model.
     */
    constructor(bpModel: Object, effect) {
        this._bpModel = bpModel;
        this._selectedVideoEffectFilter = effect;

        // Bind event handler so it is only bound once for every instance.
        this._onMaskFrameTimer = this._onMaskFrameTimer.bind(this);

        // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElementContext = this._outputCanvasElement.getContext('2d');
        this._inputVideoElement = document.createElement('video');
        this._nextSegmentationDataReady = true;

        this._maskFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Blur effect worker' });
        this._maskFrameTimerWorker.onmessage = this._onMaskFrameTimer;
        
        // Video effect image to draw onto the real image
        this._effectImage = new Image();
        switch (this._selectedVideoEffectFilter) {
			case BUNNY_EARS_ENABLED:
				this._effectImage.src = 'images/bunny_ears.png';
				break;
			case POI_FILTER_ENABLED:
				this._effectImage.src = 'images/poi_effect.png';
				break;
		}
        
    }

    /**
     * EventHandler onmessage for the maskFrameTimerWorker WebWorker.
     *
     * @private
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
    async _onMaskFrameTimer(response: Object) {
        if (response.data.id === INTERVAL_TIMEOUT) {
            if (!this._maskInProgress) {
                await this._renderMask();
            }
        }
    }

    /**
     * Loop function to render the background mask.
     *
     * @private
     * @returns {void}
     */
    async _renderMask() {
		console.log('Selected effect:');
		console.log(this._selectedVideoEffectFilter);
		
		var t0 = performance.now();
		
        this._maskInProgress = false;//true;
        
        if ( this._nextSegmentationDataReady ) { 
			this._nextSegmentationDataReady = false;
			this._bpModel.segmentPerson(this._inputVideoElement, {
				internalResolution: 'medium', // resized to 0.5 times of the original resolution before inference
				maxDetections: 1, // max. number of person poses to detect per image
				segmentationThreshold: 0.7 // represents probability that a pixel belongs to a person
			}).then( newSegmentationData => {
				this._segmentationData = newSegmentationData;
				this._nextSegmentationDataReady = true;
			});
		}
		
		if ( this._segmentationData ) {
		
			this._maskInProgress = false;

			const coloredPartImage = bodyPix.toMask(this._segmentationData);
					
			const opacity = 0//0.7;
			const flipHorizontal = false;
			const maskBlurAmount = 0;
			// Draw the mask image on top of the original image onto a canvas.
			// The colored part image will be drawn semi-transparent, with an opacity of
			// 0.7, allowing for the original image to be visible under.
			bodyPix.drawMask(
				this._outputCanvasElement, this._inputVideoElement, coloredPartImage, opacity, maskBlurAmount,
				flipHorizontal
			);   	
			
			
			var xNose = this._segmentationData.allPoses[0].keypoints[0].position.x;
			var yNose = this._segmentationData.allPoses[0].keypoints[0].position.y;
			var yLeftEye = this._segmentationData.allPoses[0].keypoints[1].position.y;
			var yRightEye = this._segmentationData.allPoses[0].keypoints[2].position.y;
			
			var yDiffNoseEye = yNose - (Math.min(yLeftEye, yRightEye));
			
			var posX = xNose - (this._effectImage.width / 2); 
			var posY;
				
			switch (this._selectedVideoEffectFilter) {
				case BUNNY_EARS_ENABLED:
					posY = yNose - this._effectImage.height;
					posY = posY - 2.5 * yDiffNoseEye;
					break;
				case POI_FILTER_ENABLED:
					posY = yNose - this._effectImage.height / 2;
					posY = posY - 0.5 * yDiffNoseEye;
					break;
			}	
			
			this._outputCanvasElementContext.drawImage(this._effectImage, posX, posY); 
		
		
			/*
			bodyPix.drawBokehEffect(
				this._outputCanvasElement,
				this._inputVideoElement,
				this._segmentationData,
				1, //12 Constant for background blur, integer values between 0-20
				7 // Constant for edge blur, integer values between 0-20
			);
			* */
			

			var t1 = performance.now();
			console.log("Rendering took " + (t1 - t0) + " milliseconds.");
			}
    }

    /**
     * Checks if the local track supports this effect.
     *
     * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
     * @returns {boolean} - Returns true if this effect can run on the specified track
     * false otherwise.
     */
    isEnabled(jitsiLocalTrack: Object) {
        return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType === 'camera';
    }

    /**
     * Starts loop to capture video frame and render the segmentation mask.
     *
     * @param {MediaStream} stream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(stream: MediaStream) {
        const firstVideoTrack = stream.getVideoTracks()[0];
        const { height, frameRate, width }
            = firstVideoTrack.getSettings ? firstVideoTrack.getSettings() : firstVideoTrack.getConstraints();

        this._outputCanvasElement.width = parseInt(width, 10);
        this._outputCanvasElement.height = parseInt(height, 10);
        this._inputVideoElement.width = parseInt(width, 10);
        this._inputVideoElement.height = parseInt(height, 10);
        this._inputVideoElement.autoplay = true;
        this._inputVideoElement.srcObject = stream;
        this._inputVideoElement.onloadeddata = () => {
            this._maskFrameTimerWorker.postMessage({
                id: SET_INTERVAL,
                timeMs: 1000 / parseInt(frameRate, 10)
            });
        };

        return this._outputCanvasElement.captureStream(parseInt(frameRate, 10));
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
    stopEffect() {
        this._maskFrameTimerWorker.postMessage({
            id: CLEAR_INTERVAL
        });
    }
}
