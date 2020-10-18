/**
 * SET_TIMEOUT constant is used to set interval and it is set in
 * the id property of the request.data property. timeMs property must
 * also be set. request.data example:
 *
 * {
 *      id: SET_TIMEOUT,
 *      timeMs: 33
 * }
 */
export const SET_BP_MODEL = 1;

/**
 * CLEAR_TIMEOUT constant is used to clear the interval and it is set in
 * the id property of the request.data property.
 *
 * {
 *      id: CLEAR_TIMEOUT
 * }
 */
export const SEGMENT_PERSON = 2;

/**
 * TIMEOUT_TICK constant is used as response and it is set in the id property.
 *
 * {
 *      id: TIMEOUT_TICK
 * }
 */
export const TIMEOUT_TICK = 3;

/**
 * The following code is needed as string to create a URL from a Blob.
 * The URL is then passed to a WebWorker. Reason for this is to enable
 * use of setInterval that is not throttled when tab is inactive.
 */
const code = `
	
    var bpModel;
    
    onmessage = function(request) {
    
		//console.log('Worker received request: '+request.data.id)
		//console.log(request.data);
    
		switch (request.data.id) {
			case ${SET_BP_MODEL}: {		
			
				importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
				importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix");
				console.log("Creating bpModel!");
				bodyPix.load({
					architecture: 'MobileNetV1',
					outputStride: 16,
					multiplier: 0.50,
					quantBytes: 2
				}).then(loadedModel => {
					bpModel = loadedModel;
					postMessage({
						id: ${SET_BP_MODEL},
						isInitialized: true 
					});
				});
				
				break;
			}
			case ${SEGMENT_PERSON}: {
			
				//console.debug("Received:");
				//console.debug(request.data.inputVideoElement.width);
				//console.debug("---");
			
				if (bpModel) {
				
					bpModel.segmentPerson(request.data.inputVideoElement, {
						internalResolution: 'low', // resized to 0.5 times of the original resolution before inference
						maxDetections: 1, // max. number of person poses to detect per image
						segmentationThreshold: 0.7, // represents probability that a pixel belongs to a person
						flipHorizontal: false,
						scoreThreshold: 0.2
					}).then(data => {
						postMessage({
							id: ${SEGMENT_PERSON},
							segmentationData: data
						});
					});
				} else {
					console.log('The bpModel not yet initialized!');
					postMessage({
						segmentationData: null
					});
				}
				break;
			}
			default: {
				postMessage('Sorry, your request does not exist.');
				break;
			}
		}
	};

`;

export const segmentationWorkerScript = URL.createObjectURL(new Blob([ code ], { type: 'application/javascript' }));
