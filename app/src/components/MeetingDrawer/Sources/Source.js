import React, { useState } from 'react';
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

	const [ devID, setDevId ] = useState('');

	navigator.mediaDevices.enumerateDevices()
		.then(async (devices) =>
		{
			const videoDevices = devices.filter(
				(device) => device.kind === 'videoinput'
			);

			for (const deviceObj of videoDevices)
			{
				if (deviceObj.label === source.device)
				{
					setDevId(deviceObj.deviceId);
				}
			}
		});

	return (
		<div
			className={classes.root}
		>
			<div>{source.id} - {source.name} - {source.device}</div>
			<Button className={classes.button} size='small' onClick={() =>
			{
				roomClient.addExternalSource({ video: true, audio: true })
					.then(
						(data) =>
						{
							// eslint-disable-next-line no-restricted-globals
							const full = `${location.protocol}//${location.host}${data['url']}`;

							roomClient.terminalClient.start(source.id, full, data['token'])
								.then(async () =>
								{
									const stream = await navigator.mediaDevices.getUserMedia({
										video : {
											deviceId : devID
										}
									});

									await roomClient.addExtraVideoPreview(
										{
											id      : source.id,
											stream  : stream.getTracks()[0],
											onClose : () =>
											{
												roomClient.terminalClient.stop(source.id);
											}
										});
								})
								.catch((err) =>
								{
									logger.error(err);
								});
						}
					)
					.catch((err) =>
					{
						logger.error(err);
					});
			}}
			> Start </Button>

			<Button className={classes.button} size='small' onClick={() =>
			{
				roomClient.disableExtraVideo(source.id);
			}}
			> Stop </Button>
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
