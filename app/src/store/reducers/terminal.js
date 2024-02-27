const initialState =
	{
		connected : false,
		version   : null,
		sources   : {},
		statuses  : {}
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
		case 'SET_STATUSES':
		{
			const { statuses } = action.payload;

			return { ...state, statuses };
		}
		case 'SET_STATUS':
		{
			const { id, status } = action.payload;

			return { ...state, statuses: { ...state.statuses, [id]: status } };
		}
		default:
			return state;
	}
};

export default terminal;
