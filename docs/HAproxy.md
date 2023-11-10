# Howto deploy a (room based) load balanced cluster

This example will show how to setup an HA proxy to provide load balancing between several
edumeet servers.

## IP and DNS

In this basic example we use the following names and ips:

### Backend

* `roomserver1.example.com` <=> `192.0.2.1`
* `roomserver2.example.com` <=> `192.0.2.2`
* `roomserver3.example.com` <=> `192.0.2.3`


### Load balancer HAproxy

* `meet.example.com` <=> `192.0.2.5`

## Deploy multiple edumeet-room-servers
Look in edumeet-docker or edumeet-room-server repo to see how to deploy multiple edumeet-room-server.
TBD: Add example here

## Deploy edumeet-media-nodes
Look in edumeet-docker or edumeet-media-node repo to see how to deploy multiple one edumeet-media-node.
TBD: Add example here

## Deploy edumeet-management-server
Look in edumeet-docker or edumeet-management-server repo to see how to deploy one edumeet-management-server.
TBD: Add how to setup multiple edumeet-management-server
TBD: Add how to scale up database

## Deploy HA proxy
HA proxy is used to load balance between the edumeet-room-servers.
* Configure certificate / letsencrypt for `meet.example.com`
* Install and setup haproxy

  `apt install haproxy`

* Add to /etc/haproxy/haproxy.cfg config

  ``` plaintext
    backend edumeet
        balance url_param roomId
        hash-type consistent

        server roomserver1 192.0.2.1:80 check maxconn 2000 verify none
        server roomserver2 192.0.2.2:80 check maxconn 2000 verify none
        server roomserver3 192.0.2.3:80 check maxconn 2000 verify none

    frontend meet.example.com
        bind 192.0.2.5:80
        bind 192.0.2.5:443 ssl crt /root/certificate.pem
        http-request redirect scheme https unless { ssl_fc }
        reqadd X-Forwarded-Proto:\ https
        default_backend edumeet
  ```
