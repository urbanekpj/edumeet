import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { withRoomContext } from '../../../RoomContext';
import { connect } from 'react-redux';
import Source from './Source';

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
		roomClient,
		version,
		sources,
		statuses,
		classes
	} = props;

	const [ data, setData ] = useState({});

	return (
		<Paper className={classes.root}>
			<Button size='small' onClick={(e) =>
			{
				roomClient.addExternalSource({ video: true, audio: true })
					.then(
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

			<pre> {version} </pre>
			<pre> {JSON.stringify(statuses, null, 2)} </pre>

			{sources.length === 0
				? (<div>No Sources</div>)
				: Object.values(sources)
					.map((item) =>
					{
						return <Source key={item.id} source={item}/>;
					})
			}
		</Paper>
	);
};

Sources.propTypes =
	{
		classes    : PropTypes.object.isRequired,
		roomClient : PropTypes.object.isRequired,
		version    : PropTypes.string.isRequired,
		sources    : PropTypes.object.isRequired,
		statuses   : PropTypes.object.isRequired
	};

const mapStateToProps = (state) =>
{
	return state.terminal;
};

const mapDispatchToProps = {};

export default withRoomContext(connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{}
)(withStyles(styles)(Sources)));
