import AgoraRTC from "agora-rtc-sdk-ng";
import React, { Component } from "react";
import PropTypes from "prop-types";

class AGPublish extends Component {
  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.clearTrack();
  }

  componentDidUpdate(prevProps, prevState) {
    const cast = (value, defaultValue) =>
      value === undefined ? defaultValue : value;

    const shouldUpdate = (key, defaultValue, name) => {
      const previous = cast(prevProps[name][key], defaultValue);
      const current = cast(this.props[name][key], defaultValue);
      return previous !== current;
    };

    if (shouldUpdate("cameraId", undefined, "cameraConfig")) {
      this.updateTrack("camera", this.props.cameraConfig);
    } else if (shouldUpdate("microphoneId", undefined, "micConfig")) {
      this.updateTrack("mic", this.props.micConfig);
    }
  }

  init = async () => {
    if (!this.props.client) {
      return;
    }
    await this.createTrack();
    await this.playAndPublish();
  };

  createTrack = async () => {
    const { onTrackErr, cameraConfig, micConfig } = this.props;
    let camOpt = { cameraId: "" };
    let micOpt = { microphoneId: "" };
    if (cameraConfig && typeof cameraConfig === "object") {
      camOpt = { ...camOpt, ...cameraConfig };
    }
    if (micConfig && typeof micConfig === "object") {
      micOpt = { ...micOpt, ...micConfig };
    }
    try {
      [this.videoTrack, this.audioTrack] = await Promise.all([
        AgoraRTC.createCameraVideoTrack(camOpt),
        AgoraRTC.createMicrophoneAudioTrack(micOpt),
      ]);
    } catch (err) {
      if (onTrackErr && typeof onTrackErr === "function") {
        onTrackErr(err);
      }
    }
  };

  updateTrack = async (type = "", config) => {
    const { client, container } = this.props;
    const currTrack = type === "mic" ? this.audioTrack : this.videoTrack;
    let track = null;
    try {
      await client.unpublish(currTrack);
      currTrack.stop();
      currTrack.close();
      if (type === "camera") {
        track = await AgoraRTC.createCameraVideoTrack(config);
        this.videoTrack = track;
      } else if (type === "mic") {
        track = await AgoraRTC.createMicrophoneAudioTrack(config);
        this.audioTrack = track;
      } else {
        track = await AgoraRTC.createScreenVideoTrack(config);
        this.videoTrack = track;
      }
      if (type === "camera" || type === "screen") {
        track.play(container || "local_container");
      } else {
        track.play();
      }
      await client.publish(track);
    } catch (error) {
      console.log("update track", error);
    }
  };

  playAndPublish = async () => {
    const { container, client, onPublishErr } = this.props;
    this.videoTrack.play(container || "local_container");
    if (client) {
      try {
        await client.publish([this.videoTrack, this.audioTrack]);
      } catch (err) {
        if (onPublishErr && typeof onPublishErr === "function") {
          onPublishErr(err);
        }
      }
    }
  };

  clearTrack = () => {
    this.videoTrack.stop();
    this.videoTrack.close();
    this.audioTrack.stop();
    this.audioTrack.close();
    this.videoTrack = null;
    this.audioTrack = null;
  };

  render() {
    return !this.props.container && <div id="local_container"></div>;
  }
}

AGPublish.propTypes = {
  client: PropTypes.object,
  onUnpublish: PropTypes.func,
  container: PropTypes.string,
  onPublishErr: PropTypes.func,
  onTrackErr: PropTypes.func,
  camera: PropTypes.string,
  mic: PropTypes.string,
  screenConfig: PropTypes.object,
};

export default AGPublish;
