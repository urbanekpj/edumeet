# ![edumeet logo](https://github.com/edumeet/edumeet-client/blob/main/public/images/logo.edumeet.svg) **WebRTC meeting service using [mediasoup](https://mediasoup.org).**
Official website: [edumeet.org](https://edumeet.org)

Try it online at [letsmeet.no](https://letsmeet.no)

## Main features

| Feature  | Description |
| ------------- | ------------- |
| **A/V streaming** | Share your microphone and camera + additional video stream  |
| **Video layouts** | Choose between **Democratic** and **Filmstrip** views. More in progress. |
| **Screen sharing** | Share your screen to make some presentation right from your desktop |
| **File sharing** | Share your files with the peers (torrent solution under the hood) |
| **Chat messages**  | Text conversation with other participants |
| **Local Recording**  | Record window/tab/screen content in browser supported formats with room audio and save them (**disabled by default**) |
| **Authentication**  | Supported types: **OIDC**, **SAML**, **local db (text-based)** |


## Internationalization (22 languages) 
<details>
  <summary>Help us with translations:exclamation:</summary>

  ### How to contribute?

  Try our web based translation service:
    https://translator.letsmeet.hu/
    
  Or manually:

  1. Continue to translate existing [language file](/app/src/intl/translations)
  2. find the _null_  values
  >	"settings.language": null,
  3. replace them based on the _en.json_ file
  >	"settings.language": "Select language",
  4. If your language is not listed, create a new translation _.json_ file..
  >	copy en.json to [_"two letter country code"_.json](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) and translate to your languange 
  5. make a Pull Request, or send us a file by [e-mail](mailto:community@lists.edumeet.org)
	
  Thank you in advance!
</details>


## Local Recording
<details>
  <summary>See more</summary>
  
* Local Recording records the browser window video and audio. From the list of media formats that your  browser supports you can select your preferred media format in the settings menu advanced video menu setting.  MediaRecorder makes small chucks of recording and these recorded blob chunks temporary stored in IndexedDB, if IndexedDB implemented in your browser. Otherwise it stores blobs in memory in an array of blobs.
Local Recording creates a local IndexedDB with the name of the starting timestamp (unix timestamp format)  And a storage called chunks. All chunks read in an array and created a final blob that you can download. After blobs array concatenation as a big blob, this big blob saved as file, and finally we delete the temporary local IndexedDB.

* Local recording is **disabled** by default. It could be enabled by setting _localRecordingEnabled_ to true in  (./app/public/config/config.js)

* **WARNING**: Take care that local recording will increase cpu, memory and disk space consumption.
**Enough free disk space has to be provided!!!**
Keep in mind that Browsers don't allow to use all the disk free capacity!
See more info about browsers storage limits:
  * <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria#storage_limits>
  * <https://chromium.googlesource.com/chromium/src/+/refs/heads/master/storage/browser/quota/quota_settings.cc#68>

</details>

## Installation 

See here for [Docker](https://github.com/edumeet/edumeet-docker/) 

## Architecture
![Architecture](docs/images/general-arch.png)


## Community-driven support
| Type                |                                                |
| -----------         | -----------                                    |
| Open mailing list   | community@lists.edumeet.org                    |
| Subscribe           | lists.edumeet.org/sympa/subscribe/community/   |
| Open archive        | lists.edumeet.org/sympa/arc/community/         |

## Authors

* Håvar Aambø Fosstveit
* Stefan Otto
* Mészáros Mihály
* Roman Drozd
* Rémai Gábor László
* Piotr Pawałowski

This started as a fork of the [work](https://github.com/versatica/mediasoup-demo) done by:

* Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]

## License

MIT License (see `LICENSE.md`)

Contributions to this work were made on behalf of the GÉANT project, a project that has received funding from the European Union’s Horizon 2020 research and innovation programme under Grant Agreement No. 731122 (GN4-2). On behalf of GÉANT project, GÉANT Association is the sole owner of the copyright in all material which was developed by a member of the GÉANT project.

GÉANT Vereniging (Association) is registered with the Chamber of Commerce in Amsterdam with registration number 40535155 and operates in the UK as a branch of GÉANT Vereniging. Registered office: Hoekenrode 3, 1102BR Amsterdam, The Netherlands. UK branch address: City House, 126-130 Hills Road, Cambridge CB2 1PQ, UK.

