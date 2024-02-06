import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { withRoomContext } from '../../../RoomContext';
import { connect } from 'react-redux';

const styles = () =>
	({
		root :
			{
				display       : 'flex',
				flexDirection : 'column',
				width         : '100%',
				height        : '100%',
				overflowY     : 'auto'
			}
	});

const Sources = (props) =>
{
	const {
		classes,
		roomClient
	} = props;

	const [ data, setData ] = useState({});

	return (
		<Paper className={classes.root}>
			<Button size='small' onClick={(e) =>
			{
				roomClient.addExternalSource({ video: true, audio: true }).then(
					(returned) =>
					{
						setData(returned);
					}
				)
					.catch((err) =>
					{
						setData(err);
					});
			}}
			> Init </Button>
			<pre> {JSON.stringify(data, null, 2)} </pre>
			<Button size='small' onClick={(e) =>
			{

			}}
			> Unpublished </Button>
		</Paper>
	);
};

Sources.propTypes =
	{
		classes    : PropTypes.object.isRequired,
		roomClient : PropTypes.object.isRequired
	};

const mapStateToProps = () =>
	({});

const mapDispatchToProps = {};

export default withRoomContext(connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{}
)(withStyles(styles)(Sources)));
