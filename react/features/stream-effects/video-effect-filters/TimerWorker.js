
/**
* SET_INTERVAL constant is used to set interval and it is set in 
* the id property of the request.data property. timeMs must also
* be set. Same as worker of the background blur effect.
*/
export const SET_INTERVAL = 1;


/**
* CLEAR_INTERVAL constant is used to clear the interval and it
* is set in the id property of the request.data property.
*/
export const CLEAR_INTERVAL = 2;

/**
* INTERVAL_TIMEOUT constant is used as response and it is set
* in the id property.
*/
export const INTERVAL_TIMEOUT = 3;

/**
* Same principle as in the Worker of the background blur effect.
*/
const code = `
	var timer;

	onmessage = function(request) {
		switch (request.data.id) {
		case ${SET_INTERVAL}: {
			timer = setInterval(() => {
				postMessage({ id: ${INTERVAL_TIMEOUT} });
			}, request.data.timeMs);
			break;
		}
		}
	};
`;

export const timerWorkerScript = URL.createObjectURL(new Blob([ code ], { type: 'application/javascript' }));

