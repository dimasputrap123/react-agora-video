import React, { Component } from "react";
import "./bootstrap.css";
import "./App.css";
import { AGPublish, createClient } from "./vendor";
import FormSetting from "./FormSetting";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectState: false,
      camera: "",
      mic: "",
      profile: "",
      publishVideo: false,
      publishAudio: false,
    };
  }
  componentWillUnmount() {
    if (this.client) this.client.disconnect();
  }
  joinHandler = (e) => {
    console.log(e);
  };
  publishHandler = (e) => {
    console.log(e);
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
  handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(Object.fromEntries(data));
    const {
      appid,
      token,
      channel,
      camera,
      mic,
      profile,
      publishAudio,
      publishVideo,
    } = Object.fromEntries(data);
    this.setState({
      ...this.state,
      camera,
      mic,
      profile,
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
      })
      .catch((err) => {
        console.log("leaving failed:", err);
      });
  };

  handleSelect = (value, name) => {
    this.setState({ ...this.state, [name]: value });
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
              micConfig={{ microphoneId: this.state.mic }}
            />
          )}
          <div className="gridVideo" id="gridVideo">
            <div className="video" id="local_video"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
