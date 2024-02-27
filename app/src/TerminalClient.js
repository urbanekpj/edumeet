import Logger from './Logger';

import * as terminalActions from './store/actions/terminalActions';
import { Client, makeTransport } from '@medvc/core_client';
import { Main, Sources, Terminal, GetAV, Status } from '@medvc/terminal_client';

const logger = new Logger('Terminal Client');

let store;

export default class TerminalClient
{

	static init(data)
	{
		store = data.store;
	}

	constructor(
		{
			uri
		} = {})
	{
		this.uri = uri;

		this.client = new Client(makeTransport(uri), {});

		this._closed = !this.client.isConnected();
		this.sources = new Sources(this.client);
		this.terminal = new Terminal(this.client);
		this.main = new Main(this.client);
		this.main.version()
			.then((version) =>
			{
				store.dispatch(terminalActions.setTerminalVersion(version));
			});
		this.sources.init()
			.then((sources) =>
			{
				store.dispatch(terminalActions.setSources(sources.sources));
			});

		this.terminal.statuses()
			.then((statuses) =>
			{
				store.dispatch(terminalActions.setStatuses(statuses.statuses));
			});

	}
	start(id, endpoint, token)
	{
		return this.terminal.start(id, endpoint, token).then((status) =>
		{

			store.dispatch(terminalActions.setStatus({ id, status }));

			return status;
		});
	}
	stop(id)
	{
		return this.terminal.stop(id).then((status) =>
		{

			store.dispatch(terminalActions.setStatus({ id, status }));

			return status;
		});
	}
	close()
	{
		if (this._closed)
			return;

		this._closed = true;

		logger.debug('close()');

	}

}
