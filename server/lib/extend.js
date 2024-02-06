import Logger from './logger/Logger';

const logger = new Logger('Extended');
const axios = require('axios');

export async function addExternalSource(router, peer, room, { video, audio })
{
	const videoTransport = await router.createPlainTransport(
		{
			listenIp : '0.0.0.0',
			rtcpMux  : false,
			comedia  : true
		});

	const videoRtpPort = videoTransport.tuple.localPort;
	const videoRtcpPort = videoTransport.rtcpTuple.localPort;

	logger.error('---------------------------', videoRtpPort, videoRtcpPort);
	const videoProducer = await videoTransport.produce(
		{
			kind          : 'video',
			rtpParameters :
				{
					mid    : 'video0',
					codecs :
						[
							{
								mimeType     : 'video/vp8',
								clockRate    : 90000,
								payloadType  : 101,
								rtcpFeedback : [
								]
							}
						],
					encodings : [ { ssrc: 22222222 } ]
				},
			appData : {
				source : 'extravideo'
			}
		});

	logger.error('---------------------------', videoProducer.id);
	const ID = (Math.random() + 1).toString(36).substring(7);
	const token = ID;
	const whip = {
		id        : ID,
		room      : 1234,
		label     : `label_${ID}`,
		recipient : {
			host : '127.0.0.1'
		}
	};

	if (video)
	{

		whip.recipient.videoPort = 7100;
		whip.recipient.videoRtcpPort = 7101;
		whip.recipient.videoPt = 101;
		whip.recipient.videoSsrc = 22222222;
	}

	await axios
		.post('http://127.0.0.1:7080/whip/create', whip);

	peer.addTransport(videoTransport.id, videoTransport);

	const pipeRouters = room._getRoutersToPipeTo(peer.routerId);

	for (const [ routerId, destinationRouter ] of room._mediasoupRouters)
	{
		if (pipeRouters.includes(routerId))
		{
			await router.pipeToRouter({
				producerId : videoProducer.id,
				router     : destinationRouter
			});
		}
	}

	// Store the Producer into the Peer data Object.
	peer.addProducer(videoProducer.id, videoProducer);

	/*

	// Set Producer events.
	videoProducer.on('score', (score) =>
	{
		room._notification(peer.socket,
		'producerScore', { producerId: videoProducer.id, score });
	});

	videoProducer.on('videoorientationchange', (videoOrientation) =>
	{
		logger.debug(
			'producer "videoorientationchange" event [producerId:"%s", videoOrientation:"%o"]',
			videoProducer.id, videoOrientation);
	});
*/

	// Optimization: Create a server-side Consumer for each Peer.
	for (const otherPeer of room.getJoinedPeers(peer))
	{
		logger.error(otherPeer.id);
		room._createConsumer(
			{
				consumerPeer : otherPeer,
				producerPeer : peer,
				producer     : videoProducer
			}).catch((err) => logger.error(err));
	}
	const url = `http://localhost:7080/whip/endpoint/${ID}`;

	return {
		token,
		videoRtpPort,
		videoRtcpPort,
		ID,
		url
	};
}

export async function removeExternalSource(router, peer, room, { id, token })
{
	return axios.delete(`http://127.0.0.1:7080/whip/endpoint/${id}`, {
		headers : { Authorization: `Bearer ${token}` }
	});
}
