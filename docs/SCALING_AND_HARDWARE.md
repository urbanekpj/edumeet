# Scaling and recommended Hardware
## Recommended hardware for running
EduMEET consist of several components. The most important in context of scaling and performance are the edumeet-media-nodes and edumeet-room-server components. In generell eduMEET can run comletely on one machine but for scaling and performance reasons it is recommended to run the components on different machines.
For deployment on 1 machine:
* EduMEET scales by threads so more cores are better
* 16GB RAM is recommended
* Disk space is not so important - 20GB is a good start - but logs can get huge :) 
* 1GB/s network adapter or BETTER
Such a machine can handle around 400 concurrent users (see example calculation below).

### Scaling edumeet-media-nodes: ( numbers are not final yet )
This is the most important component for scaling. 
* Network: Calculate 400 concurrent participants per 1Gbit/s bandwidth
* CPU: 1 core per 200 concurrent participants 
* RAM: 6GB + 1GB per 200 concurrent participants
* Disk: 20GB

### Scaling edumeet-room-server: ( numbers are not final yet )
* Network: Calculate 4000 concurrent participants per 1Gbit/s bandwidth
* CPU: 1 core + 1 core per 2000 concurrent participants
* RAM: 8GB + 1GB per 4000 concurrent participants
* Loadbalancer: sticky sessions

## Network
The bandwidth requirements are quite tunable both on client and server, but server DOWNSTREAM to clients bandwidth will be one of the largest constraints on the system. If you have 1Gbit on your nodes, the number of users should not exceed ~400 per server Gbit, and this can be run without a problem on a modern 8 core server. If you have higher bandwidth per node, the numbers can be scaled up linearly (2Gbit/16core/1200 users). Note that this is concurrent users, so if you anticipate ~10000 concurrent users, scale it according to these numbers. Real number of concurrent users depends on typical size of rooms(bigger rooms are usually more efficient), lastN config (lower is better), maxIncomingBitrate config (lower is better), use of simulcast. 

## Example calculation
### 1 Server
* 4 cores - 8 threads: 8 x 400 = 3200 concurrent consumers-streams ( 1 participant consumes typically 1 audiostream + x video-streams depending on lastN settings )
* MINIMUM 1 Gbit/s connection is a good start. Calculate around 2 Mbit/s downstream (from server to client) per participant (1 Gbit/s = 1000 Mbit/s / 2 Mbit/s = 500 participants)
* For higher quality video or more participants you need **more** than 1Gbit/s
* Not enough network bandwidth will reduce video-quality (increasing latency, jitter and packet loss and reduce user experience)

### Consumer:
* Def.: Streams that are consumed by participants
* Example 1(refering to example server from above): lastN=1: max 1600 students can consume audio + video stream from 1 lecturer (2 streams x 1600 students = 3200 consumers) 
* Example 2(refering to example server from above): lastN=5: Rooms with 6 users each: 6 users x 5 remote users ( = 30 video-consumers)  + 6 audio-consumers = 36 consumers per room. 3200 consumers / 36 consumers per room = 88 rooms with 6 users each (528 users in total)
* Example 3(refering to example server from above): lastN=5: 1 one big room: 3200 [consumer] / 6 [consumer/participant] = 533 [participant] That's the maximum number of participants per server for lastN=5 in one single big room
* Example 3(refering to example server from above): lastN=25: 1 one big room: 3200 [consumer] / 26 [consumer/participant] = 123 [participant] That's the maximum number of participants per server for lastN=25 in one single big room

### Bandwidth:
* Configurable: maxIncomingBitrate per participant in management-server
* Low video bandwidth is around 160Kbps (240p-vp8) (This is the lowest video quality that is acceptable? for a videoconference)
* Typical acceptable video bandwidth is around (800-1000)Kbps (720p)
* Typical bandwidth for a good experience is around 2000Kbps (1080p)

## Scaling
### Scaling with docker-compose
Scaling is done by:
- adding additionally medianodes
- scaling up database for the management-server
- scale up (static content delivery server) by loadbalancing

Potential other bottleneck is the room-server component which will be scalable in the future as well.


### Limitations / work in progress / ToDo
* Currently there is no loadbalancing for the management-server
