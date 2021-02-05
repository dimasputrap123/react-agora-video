# react-agora-video

Basic agora video streaming with react js

## Usage

### createClient

Function createClient berfungsi untuk membuat object AgoraRTCClient untuk mengelola panggilan. Pengguna dapat memasukkan data akses Agora (APPID & token), client config (codec & mode), dan event handler.

```js
 joinHandler=e=>{
     console.log(e)
 }
 publisherHandler=e=>{
     console.log(e)
 }

 componentDidMount(){
     this.client = createClient({
      codec: "vp8",
      mode: "rtc",
      joinUpdated: this.joinHandler,
      publishUpdated: this.publishHandler,
      onError: this.errHandler,
      events: [
        { event: "connection-state-change", handler: this.connectHandler },
      ],
      appid,
      token,
      channel,
    });
 }
```

### AGPublish

AGPublish berfungsi untuk mengelola local user seperti, local track (video, screen, & audio), device (kamera dan mic), dan publish local track.

```js
<AGPublish
  client={this.client.client}
  container="local_video"
  publishVideo={this.state.publishVideo}
  publishAudio={this.state.publishAudio}
  cameraConfig={{
    cameraId: this.state.camera,
    encoderConfig: this.state.profile,
  }}
  micConfig={{
    microphoneId: this.state.mic,
    encoderConfig: this.state.audioProfile,
  }}
  screenShare={this.state.screenShare}
  screenConfig={{ encoderConfig: this.state.screenProfile }}
  onScreenCancel={this.handleScreenShare}
  onScreenStop={this.handleScreenShare}
/>
```

### AGRemote

AGRemote berfungsi untuk mengelola remote user.

```js
<AGRemote
  subscribeVideo={subscribeVideo}
  subscribeAudio={subscribeAudio}
  client={client}
  remoteData={remote[uid]}
  container={`remote-${uid}`}
  onError={remoteError}
/>
```

## API Reference

### AGPublish

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| client | object | yes | AgoraRTCClient [AgoraRTCClient](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/iagorartcclient.html) object |
| container | string | no | Id container untuk local video |
| containerClass | string | no | className untuk default container local video |
| cameraConfig | object | no | konfigurasi kamera dapat dilihat disini [disini](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/cameravideotrackinitconfig.html) |
| micConfig | object | no | konfigurasi mic dapat dilihat disini [disini](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/microphoneaudiotrackinitconfig.html) |
| publishVideo | boolean | no | publish atau unpublish video |
| publishAudio | boolean | no | publish atau unpublish audio |
| screenShare | boolean | no | publish atau unpublish screen sharing |
| screenConfig | object | no | konfigurasi screen share dapat dilihat disini [disini](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/screenvideotrackinitconfig.html) |
| onScreenCancel | function | no | aktif ketika screen sharing di cancel |
| onScreenStop | function | no | aktif ketika screen sharing di stop |
| onError | function | no | aktif ketika terjadi error |
### AGRemote

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| client | object | yes | AgoraRTCClient [AgoraRTCClient](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/iagorartcclient.html) object |
| remoteData | object | yes | remote user [user](https://docs.agora.io/en/live-streaming/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html) |
| container | string | no | Id container untuk remote video |
| containerClass | string | no | className untuk default container remote video |
| onError | function | no | aktif ketika terjadi error |

