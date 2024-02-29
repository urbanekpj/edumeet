import { EventEmitter } from 'events';
import Logger from './logger/Logger';
import { v4 as uuidv4 } from 'uuid';

import { config } from './config/config';

const sdpCommonUtils = require('mediasoup-client/lib/handlers/sdp/commonUtils');
const ortc = require('mediasoup-client/lib/ortc');
const utils = require('mediasoup-client/lib/utils');
const sdpUnifiedPlanUtils = require('mediasoup-client/lib/handlers/sdp/unifiedPlanUtils');
const sdpTransform = require('sdp-transform');
const { RemoteSdp } = require('mediasoup-client/lib/handlers/sdp/RemoteSdp');

const logger = new Logger('Whip');

class Whip extends EventEmitter
{

	/**
	 * @param {Room} room
	 */
	static async create({ room })
	{
		return new Whip({ room });
	}

	/**
	 * @param {Room} room
	 */
	constructor({ room })
	{
		super();
		logger.info('constructor() [roomId:"%s"]', room.id);
		this.room = room;
		this.endpoints = new Map();
	}

	close()
	{
		logger.info('close room [roomId:"%s"]', this.room.id);
	}

	async deleteEndpoint({ peer, data })
	{
		const srcId = data.id;

		logger.info('deleteEndpoint() [roomId:"%s", peerId:"%s", srcID:"%s"]', this.room.id, peer.id, srcId);
		this.endpoints.forEach((endpoint, id) =>
		{
			if (endpoint.peer.id === peer.id && endpoint.srcID === srcId)
			{
				logger.info('deleteEndpoint() [roomId:"%s", peerId:"%s", id:"%s"]', this.room.id, peer.id, id);
				this.handleDelete({ id })
					.then(() => this.endpoints.delete(id));
			}
		});

		return { };
	}

	createEndpoint({ peer, data })
	{
		const id = uuidv4();
		const token = uuidv4();

		logger.info('createEndpoint [roomId:"%s", peerId:"%s", id:"%s"]', this.room.id, peer.id, id);
		this.endpoints.set(id, { peer,
			data,
			forceTcp  : data.forceTcp,
			token,
			producers : [],
			remoteSdp : null,
			appData   : data.appData,
			srcID     : data.appData.id
		});
		peer.on('close', () =>
		{
			logger.info('close peer [roomId:"%s", peerId:"%s", id:"%s"]]', this.room.id, peer.id, id);
			this.endpoints.delete(id);
		});

		return { url: `/whip/${this.room.id}/${id}`, token, id };
	}

	isValidAuth(id, token)
	{
		const endpoint = this.endpoints.get(id);

		logger.debug(endpoint, token);

		return endpoint && endpoint.token === token;
	}

	async handlePost({ id, sdp })
	{

		logger.info('handle post [roomId:"%s",id:"%s"]', this.room.id, id);
		logger.debug('handle post [roomId:"%s",id:"%s"]', this.room.id, id, sdp);
		if (!this.endpoints.has(id))
		{
			logger.info('endpoint already removed [roomId:"%s",id:"%s"] ', this.room.id, id);

			return;
		}

		const endpoint = this.endpoints.get(id);

		if (!sdp || Object.keys(sdp).length === 0)
		{
			throw new Error('missing spd');
		}
		const localSdpObject = sdpTransform.parse(sdp);

		const rtpCapabilities = sdpCommonUtils.extractRtpCapabilities(
			{ sdpObject: localSdpObject });
		const dtlsParameters = sdpCommonUtils.extractDtlsParameters(
			{ sdpObject: localSdpObject });

		const router = this.room._mediasoupRouters.get(endpoint.peer.routerId);
		const routerRtpCapabilities = router.rtpCapabilities;

		const extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(
			rtpCapabilities, routerRtpCapabilities);

		const sendingRtpParametersByKind = {
			audio : ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
			video : ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
		};
		const sendingRemoteRtpParametersByKind = {
			audio : ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
			video : ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
		};

		const webRtcTransportOptions = {
			...config.mediasoup.webRtcTransport, appData : { producing: true, consuming: false }
		};

		webRtcTransportOptions.enableTcp = true;

		if (endpoint.forceTcp)
		{
			webRtcTransportOptions.enableUdp = false;
		}
		else
		{
			webRtcTransportOptions.enableUdp = true;
			webRtcTransportOptions.preferUdp = true;
		}

		const transport = await router.createWebRtcTransport(webRtcTransportOptions);

		transport.on('dtlsstatechange', (dtlsState) =>
		{
			if (dtlsState === 'failed' || dtlsState === 'closed')
			{
				logger.warn('WebRtcTransport "dtlsstatechange" event [dtlsState:%s]', dtlsState);
			}
		});

		// Store the WebRtcTransport into the Peer data Object.

		await transport.connect({ dtlsParameters });
		endpoint.peer.addTransport(transport.id, transport);
		endpoint.transportId = transport.id;

		const remoteSdp = new RemoteSdp({
			iceParameters  : transport.iceParameters,
			iceCandidates  : transport.iceCandidates,
			dtlsParameters : transport.dtlsParameters,
			sctpParameters : transport.sctpParameters
		});

		for (const { type, mid } of localSdpObject.media)
		{
			const mediaSectionIdx = remoteSdp.getNextMediaSectionIdx();
			const offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];

			const sendingRtpParameters = utils.clone(sendingRtpParametersByKind[type], {});

			const sendingRemoteRtpParameters = utils.clone(sendingRemoteRtpParametersByKind[type], {});

			// Set MID.
			sendingRtpParameters.mid = String(mid);

			// Set RTCP CNAME.
			sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });

			// Set RTP encodings by parsing the SDP offer.
			sendingRtpParameters.encodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });

			remoteSdp.send({
				offerMediaObject,
				reuseMid            : mediaSectionIdx.reuseMid,
				offerRtpParameters  : sendingRtpParameters,
				answerRtpParameters : sendingRemoteRtpParameters,
				codecOptions        : {},
				extmapAllowMixed    : true
			});
			const producer = await transport.produce({
				kind          : type,
				rtpParameters : sendingRtpParameters,
				appData       : endpoint.appData
			});

			endpoint.peer.addProducer(producer.id, producer);
			endpoint.producers.push(producer.id);
			for (const otherPeer of this.room.getJoinedPeers(endpoint.peer))
			{
				this.room._createConsumer({
					consumerPeer : otherPeer, producerPeer : endpoint.peer, producer : producer
				})
					.catch((err) =>
					{
						logger.error('Create Consumer error', err);
						logger.error(err);
					});
			}
		}

		logger.error(endpoint.peer.transports);
		endpoint.removeSdp = remoteSdp;

		return endpoint.removeSdp.getSdp();
	}

	async handleDelete({ id })
	{
		logger.info('handle delete [roomId:"%s",id:"%s"]', this.room.id, id);
		logger.error(this.endpoints);

		if (!this.endpoints.has(id))
		{
			logger.info('endpoint already removed [roomId:"%s",id:"%s"] ', this.room.id, id);

			return;
		}
		const endpoint = this.endpoints.get(id);

		endpoint.removeSdp = null;

		for (const producerId of endpoint.producers)
		{
			const producer = endpoint.peer.getProducer(producerId);

			if (producer)
			{
				endpoint.peer.removeProducer(producer.id);
				producer.close();
			}
		}
		const transport = endpoint.peer.getTransport(endpoint.transportId);

		if (transport)
		{
			transport.close();
			endpoint.peer.removeTransport(transport.id);
		}
		else
		{
			logger.warn('transport not exists [roomId:"%s",id:"%s"] ', this.room.id, id);
		}

		endpoint.producers = [];
		endpoint.transportId = null;
	}

	async handlePatch({ id })
	{

		logger.info('handle patch [roomId:"%s",id:"%s"]', this.room.id, id);

		if (!this.endpoints.has(id))
		{
			logger.info('endpoint already removed [roomId:"%s",id:"%s"] ', this.room.id, id);

			return;
		}
		const endpoint = this.endpoints.get(id);
		const remoteSdp = endpoint.remoteSdp;

		logger.error(endpoint.peer.transports);
		const transport = endpoint.peer.getTransport(endpoint.transportId);

		if (!transport) throw new Error(`transport with id "${endpoint.transportId}" does not exist`);

		const iceParameters = await transport.restartIce();

		remoteSdp.updateIceParameters(iceParameters);

		return remoteSdp.getSdp();
	}
}

module.exports = Whip;
