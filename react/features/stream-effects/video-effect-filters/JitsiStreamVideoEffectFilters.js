// @flow

import * as StackBlur from 'stackblur-canvas';

import {
    CLEAR_TIMEOUT,
    TIMEOUT_TICK,
    SET_TIMEOUT,
    timerWorkerScript
} from './TimerWorker';

import {
	SET_BP_MODEL,
	SEGMENT_PERSON,
	segmentationWorkerScript
} from './SegmentationWorker';

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
//    _bpModel: Object;
    _inputVideoElement: HTMLVideoElement;
    _inputVideoCanvasElement: HTMLCanvasElement;
    _onMaskFrameTimer: Function;
    _maskFrameTimerWorker: Worker;
    _maskInProgress: boolean;
    _outputCanvasElement: HTMLCanvasElement;
    _outputCanvasElementContext : CanvasRenderingContext2D;
    _renderMask: Function;
    _segmentationData: Object;
    _selectedVideoEffectFilter: String;
    isEnabled: Function;
    startEffect: Function;
    stopEffect: Function;
    _segmentationWorker: Worker;
    _workerBpModelInitialized : boolean;
    

    /**
     * Represents a modified video MediaStream track.
     *
     * @class
     * @param {BodyPix} bpModel - BodyPix model.
     */
    constructor(effect) {//bpModel: Object, effect) {
   //     this._bpModel = bpModel;
        
        this._selectedVideoEffectFilter = effect;

        // Bind event handler so it is only bound once for every instance.
        this._onMaskFrameTimer = this._onMaskFrameTimer.bind(this);

        // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElementContext = this._outputCanvasElement.getContext('2d');
        this._inputVideoElement = document.createElement('video');
        this._inputVideoCanvasElement = document.createElement('canvas');
        this.setSelectedVideoEffectFilter.bind(this);

        // this._maskFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Blur effect worker' });
        // this._maskFrameTimerWorker.onmessage = this._onMaskFrameTimer;
        
        // Video effect image to draw onto the real image
        this._effectImage = new Image();
        this.setSelectedVideoEffectFilter(effect);
        
        this._workerBpModelInitialized = false;
        
    }

    /**
     * EventHandler onmessage for the maskFrameTimerWorker WebWorker.
     *
     * @private
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
	_onMaskFrameTimer(response: Object) {
		//console.log('_onMaskFrameTimer: '+performance.now());
        if (response.data.id === TIMEOUT_TICK) {
            //if (!this._maskInProgress) {
				this._renderMask();
            //}
        }
    }
    

	/**
     * Loop function to render the background mask.
     *
     * @private
     * @returns {void}
	 */
	_renderMask() {
		//console.log('Selected effect:');
		//console.log(this._selectedVideoEffectFilter);
		
		var t0 = performance.now();
        
        /**
        if (!this._maskInProgress) {
			console.log('Calling a segmentation! ('+t0+')');
            this._maskInProgress = true;
            this._bpModel.segmentPerson(this._inputVideoElement, {
                internalResolution: 'low', // resized to 0.5 times of the original resolution before inference
                maxDetections: 1, // max. number of person poses to detect per image
                segmentationThreshold: 0.7, // represents probability that a pixel belongs to a person
                flipHorizontal: false,
                scoreThreshold: 0.2
            }).then(data => {
                this._segmentationData = data;
                this._maskInProgress = false;
            });
        } else {
			console.log('No segmentation started! ('+t0+')');
		}
		*/
		
		//const inputCanvasCtx = this._inputVideoCanvasElement.getContext('2d');

        //inputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

/**
        const currentFrame = inputCanvasCtx.getImageData(
            0,
            0,
            this._inputVideoCanvasElement.width,
            this._inputVideoCanvasElement.height
        );*/
        
        // Draw raw input image on screen 
        this._outputCanvasElementContext.drawImage(this._inputVideoElement, 0, 0); 
        
        const currentFrame = this._outputCanvasElementContext.getImageData(
			0,
			0,
			this._inputVideoElement.width,
			this._inputVideoElement.height
		);
        
        if (!this._maskInProgress && this._workerBpModelInitialized) {
			//console.log("Sending:");
			//console.log(currentFrame);
			//console.log(".");
			this._maskInProgress = true;
			this._segmentationWorker.postMessage({
				id: SEGMENT_PERSON,
				inputVideoElement: currentFrame
			});	
		}
		
		
		
		if (this._segmentationData) {
            /**const blurData = new ImageData(currentFrame.data.slice(), currentFrame.width, currentFrame.height);

            StackBlur.imageDataRGB(blurData, 0, 0, currentFrame.width, currentFrame.height, 12);

            for (let x = 0; x < this._outputCanvasElement.width; x++) {
                for (let y = 0; y < this._outputCanvasElement.height; y++) {
                    const n = (y * this._outputCanvasElement.width) + x;

                    if (this._segmentationData.data[n] === 0) {
                        currentFrame.data[n * 4] = blurData.data[n * 4];
                        currentFrame.data[(n * 4) + 1] = blurData.data[(n * 4) + 1];
                        currentFrame.data[(n * 4) + 2] = blurData.data[(n * 4) + 2];
                        currentFrame.data[(n * 4) + 3] = blurData.data[(n * 4) + 3];
                    }
                }
            }
            */
            
           /** // Draw raw input image on screen 
            this._outputCanvasElementContext.drawImage(this._inputVideoElement, 0, 0); 
            */
            
            // Video-effect-filter
            if (this._segmentationData.allPoses[0]) {
				
				var xNose = this._segmentationData.allPoses[0].keypoints[0].position.x;
				var yNose = this._segmentationData.allPoses[0].keypoints[0].position.y;
				var yLeftEye = this._segmentationData.allPoses[0].keypoints[1].position.y;
				var yRightEye = this._segmentationData.allPoses[0].keypoints[2].position.y;
				var xLeftEar = this._segmentationData.allPoses[0].keypoints[3].position.x;
				var xRightEar = this._segmentationData.allPoses[0].keypoints[4].position.x;
				
				var yDiffNoseEye = yNose - (Math.min(yLeftEye, yRightEye));
				var xDiffEars = Math.abs(xRightEar - xLeftEar);
				
				var posY;
				var scale;
					
				switch (this._selectedVideoEffectFilter) {
					case BUNNY_EARS_ENABLED:
						scale = xDiffEars * 1.9 / this._effectImage.height;
						posY = yNose - this._effectImage.height * scale;
						//console.log('posY First: '+posY+ '  scale: '+scale+ ' effImgHeight: ' + this._effectImage.height+ '  xDiffEars: '+xDiffEars);
						posY = posY - 2.4 * yDiffNoseEye;
						//console.log('posY Second: '+posY+'   müsste sein mind.: '+ (yNose - this._effectImage.height));
						break;
					case POI_FILTER_ENABLED:
						scale = xDiffEars * 1.5 / this._effectImage.width;
						posY = yNose - this._effectImage.height / 2 * scale;
						posY = posY - 0.5 * yDiffNoseEye;
						break;
				}	
				
				
				
				var posX = xNose - (this._effectImage.width / 2) * scale; 
				
				//this._outputCanvasElement.getContext('2d').putImageData(currentFrame, 0, 0);
				//this._outputCanvasElementContext.drawImage(this._effectImage, posX, posY);
				 
				// Draw effect image onto the raw image
				this._outputCanvasElementContext.drawImage(this._effectImage, posX, posY, this._effectImage.width * scale, this._effectImage.height * scale);
			}
            
        } else  {
			// This will be called only before the first segmentation has taken place
			//this._outputCanvasElementContext.drawImage(this._inputVideoElement, 0, 0);
		}
        
        this._maskFrameTimerWorker.postMessage({
            id: SET_TIMEOUT,
            timeMs: 1000 / 30
        });
		
		/**
		
		
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
		//console.log('Rendering took ' + (t1 - t0) + ' milliseconds. ('+t0+')');
		//}
		
			
		// the guy
		/**
		if (!this._maskInProgress) {
            this._maskInProgress = true;
            this._bpModel.segmentPerson(this._inputVideoElement, {
                internalResolution: 'low', // resized to 0.5 times of the original resolution before inference
                maxDetections: 1, // max. number of person poses to detect per image
                segmentationThreshold: 0.7, // represents probability that a pixel belongs to a person
                flipHorizontal: false,
                scoreThreshold: 0.2
            }).then(data => {
                this._segmentationData = data;
                this._maskInProgress = false;
            });
        }
        const inputCanvasCtx = this._inputVideoCanvasElement.getContext('2d');

        inputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

        const currentFrame = inputCanvasCtx.getImageData(
            0,
            0,
            this._inputVideoCanvasElement.width,
            this._inputVideoCanvasElement.height
        );

        if (this._segmentationData) {
            const blurData = new ImageData(currentFrame.data.slice(), currentFrame.width, currentFrame.height);

            StackBlur.imageDataRGB(blurData, 0, 0, currentFrame.width, currentFrame.height, 12);

            for (let x = 0; x < this._outputCanvasElement.width; x++) {
                for (let y = 0; y < this._outputCanvasElement.height; y++) {
                    const n = (y * this._outputCanvasElement.width) + x;

                    if (this._segmentationData.data[n] === 0) {
                        currentFrame.data[n * 4] = blurData.data[n * 4];
                        currentFrame.data[(n * 4) + 1] = blurData.data[(n * 4) + 1];
                        currentFrame.data[(n * 4) + 2] = blurData.data[(n * 4) + 2];
                        currentFrame.data[(n * 4) + 3] = blurData.data[(n * 4) + 3];
                    }
                }
            }
        }
        this._outputCanvasElement.getContext('2d').putImageData(currentFrame, 0, 0);
        this._maskFrameTimerWorker.postMessage({
            id: SET_TIMEOUT,
            timeMs: 1000 / 30
        });
        * **/
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
		this._maskFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Video effect filter timer worker' });
        this._maskFrameTimerWorker.onmessage = this._onMaskFrameTimer;
        
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
                id: SET_TIMEOUT,
                timeMs: 1000 / 30
            });
        };
        
        
        this._segmentationWorker =  new Worker(segmentationWorkerScript, { name: 'Video effect filter segmentation worker'});
        console.log('Initialized worker');
        this._segmentationWorker.onmessage = function(result) {
			//console.log('Main thread received worker result: ');
			switch(result.data.id) {
				case SET_BP_MODEL: {		
					this._workerBpModelInitialized = result.data.isInitialized;
					break;
				}
				case SEGMENT_PERSON: {
					this._segmentationData = result.data.segmentationData;
					this._maskInProgress = false;
					break;
				}
				default: {
					console.log('Unknown request / result id!');
					break;
				}
			}
			
		}.bind(this);

        console.log('Main thread posting: Worker load the bpModel!');
        this._segmentationWorker.postMessage({
            id: SET_BP_MODEL
        });
     
        return this._outputCanvasElement.captureStream(parseInt(frameRate, 10));
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
	stopEffect() {
		this._maskFrameTimerWorker.postMessage({
            id: CLEAR_TIMEOUT
        });

		this._maskFrameTimerWorker.terminate();
	}
	
	/**
	* Switches the effect of this instance.
	* 
	* @returns {void}
	*/ 
	setSelectedVideoEffectFilter(selectedVideoEffectFilter) {
		this._selectedVideoEffectFilter = selectedVideoEffectFilter;
		switch (this._selectedVideoEffectFilter) {
			case BUNNY_EARS_ENABLED:
				this._effectImage.src = 'images/bunny_ears.png';
				break;
			case POI_FILTER_ENABLED:
				this._effectImage.src = 'images/poi_effect.png';
				break;
		}
		this._workerBpModelInitialized = false;
		console.log('Switched effect to: ' + selectedVideoEffectFilter + '-----------------------------------------------------')
	}
}
