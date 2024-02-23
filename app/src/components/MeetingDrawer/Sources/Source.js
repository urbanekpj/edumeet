import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRoomContext } from '../../../RoomContext';
import PropTypes from 'prop-types';
import * as appPropTypes from '../../appPropTypes';
import { useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Logger from '../../../Logger';

const logger = new Logger('Source');

const styles = () =>
	({
		root :
			{
				width          : '100%',
				overflow       : 'hidden',
				cursor         : 'auto',
				display        : 'flex',
				justifyContent : 'center',
				alignItems     : 'center'
			},
		button : {
			background : 'red'
		}
	});

const Source = (props) =>
{
	// const intl = useIntl();

	const {
		roomClient,
		source,
		classes
	} = props;

	return (
		<div
			className={classes.root}
		>
			<div>{source.id} - {source.name} - {source.device}</div>
			<Button className={classes.button} size='small' onClick={(e) =>
			{
				roomClient.addExternalSource({ video: true, audio: true })
					.then(
						(data) =>
						{
							// eslint-disable-next-line no-restricted-globals
							const full = `${location.protocol}//${location.host}${data['url']}`;

							logger.error(source.id, full, data['token']);
							roomClient.terminalClient.terminal.start(source.id, full, data['url']['token'])
								.then((status) =>
								{
									logger.error(status);
								});
						}
					)
					.catch(() =>
					{
					});
			}}
			> Init </Button>
		</div>
	);
};

Source.propTypes =
	{
		roomClient : PropTypes.object.isRequired,
		source     : PropTypes.object.isRequired,
		classes    : PropTypes.object.isRequired
	};

const mapStateToProps = () => ({});

export default withRoomContext(connect(
	mapStateToProps,
	null,
	null,
	{}
)(withStyles(styles)(Source)));
