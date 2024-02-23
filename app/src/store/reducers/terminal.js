const initialState =
{
	connected : false,
	version   : null,
	sources   : {}
};

const terminal = (state = initialState, action) =>
{
	switch (action.type)
	{
		case 'SET_TERMINAL_STATE':
		{
			const { connected } = action.payload;

			return { ...state, connected };
		}
		case 'SET_TERMINAL_VERSION':
		{
			const { version } = action.payload;

			return { ...state, version };
		}
		case 'SET_SOURCES':
		{
			const { sources } = action.payload;

			return { ...state, sources };
		}
		default:
			return state;
	}
};

export default terminal;
