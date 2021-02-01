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
    };
  }
  componentWillUnmount() {
    this.client.disconnect();
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
    const { appid, token, channel, camera, mic } = Object.fromEntries(data);
    this.setState({ ...this.state, camera, mic });
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
              cameraConfig={{ cameraId: this.state.camera }}
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
