import Logger from './Logger';

import * as terminalActions from './store/actions/terminalActions';
import { Client, makeTransport } from '@medvc/core_client';
import { Main, Sources, Terminal } from '@medvc/terminal_client';

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
		this.main.version().then((version) =>
		{
			store.dispatch(terminalActions.setTerminalVersion(version));
		});
		this.sources.init().then((sources) =>
		{
			store.dispatch(terminalActions.setSources(sources.sources));
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
