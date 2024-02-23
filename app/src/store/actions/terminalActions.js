export const setTerminalState = (connected) =>
	({
		type    : 'SET_TERMINAL_STATE',
		payload : { connected }

	});
export const setTerminalVersion = (version) =>
	({
		type    : 'SET_TERMINAL_VERSION',
		payload : { version }

	});
export const setSources= (sources) =>
	({
		type    : 'SET_SOURCES',
		payload : { sources }

	});
