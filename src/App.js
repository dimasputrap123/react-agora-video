import React, { Component } from "react";
import "./bootstrap.css";
import "./App.css";
import { AGPublish, createClient } from "./vendor";
import FormSetting from "./FormSetting";
import Remote from "./Remote";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectState: false,
      camera: "",
      mic: "",
      profile: "",
      audioProfile: "",
      screenProfile: "",
      publishVideo: false,
      publishAudio: false,
      remoteJoin: [],
      remotePublished: {},
      screenShare: false,
    };
  }
  componentWillUnmount() {
    if (this.client) this.client.disconnect();
  }
  joinHandler = (e) => {
    this.setState((prevState) => ({
      ...prevState,
      remoteJoin: [...e],
    }));
  };
  publishHandler = (e) => {
    this.setState({
      ...this.state,
      remotePublished: { ...this.state.remotePublished, ...e },
    });
  };
  errHandler = (e) => {
    console.log(e);
  };
  connectHandler = (curr, prev, reason) => {
    if (curr === "CONNECTED") {
      this.setState({ ...this.state, connectState: true });
    } else if (curr === "DISCONNECTED") {
      this.setState({ ...this.state, connectState: false });
    }
  };
  handleScreenShare = () => {
    this.setState({ ...this.state, screenShare: !this.state.screenShare });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const {
      appid,
      token,
      channel,
      camera,
      mic,
      profile,
      audioProfile,
      screenProfile,
      publishAudio,
      publishVideo,
    } = Object.fromEntries(data);
    this.setState({
      ...this.state,
      camera,
      mic,
      profile,
      audioProfile,
      screenProfile,
      publishVideo: publishVideo ? true : false,
      publishAudio: publishAudio ? true : false,
    });
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
  };

  handleLeave = () => {
    this.client
      .disconnect()
      .then(() => {
        console.log("leaving success");
        this.setState({ remoteJoin: [], remotePublished: {} });
        const grid = document.getElementById("gridVideo");
        for (let i = 1; i < grid.childNodes.length; i++) {
          grid.removeChild(grid.childNodes[i]);
        }
      })
      .catch((err) => {
        console.log("leaving failed:", err);
      });
  };

  handleSelect = (value, name) => {
    this.setState({ ...this.state, [name]: value });
  };

  remoteError = (err) => {
    console.log(err);
  };

  render() {
    return (
      <div className="row mx-0">
        <div className="col-4">
          <FormSetting
            onSubmit={this.handleSubmit}
            onLeave={this.handleLeave}
            connectState={this.state.connectState}
            onSelectChange={this.handleSelect}
            onScreen={this.handleScreenShare}
          />
        </div>
        <div className="col-8">
          {this.state.connectState && (
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
          )}
          <div className="gridVideo" id="gridVideo">
            <div className="video" id="local_video"></div>
            {this.state.remoteJoin.map((el, id) => (
              <Remote
                key={id}
                uid={el.uid}
                client={this.client.client}
                remote={this.state.remotePublished}
                remoteError={this.remoteError}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
