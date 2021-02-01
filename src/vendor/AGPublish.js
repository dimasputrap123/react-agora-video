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
      this.updateTrack({ type: "camera", config: this.props.cameraConfig });
    } else if (shouldUpdate("microphoneId", undefined, "micConfig")) {
      this.updateTrack({ type: "mic", config: this.props.micConfig });
    } else if (shouldUpdate("encoderConfig", undefined, "cameraConfig")) {
      this.updateTrack({
        type: "camera",
        config: this.props.cameraConfig,
        updateType: "encoderConfig",
      });
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

  updateTrack = async ({ type, updateType, config }) => {
    try {
      if (type === "camera") {
        if (this.videoTrack && this.videoTrack !== null) {
          if (updateType === "encoderConfig") {
            await this.videoTrack.setEncoderConfiguration(config.encoderConfig);
          } else {
            await this.videoTrack.setDevice(config.cameraId);
          }
        }
      } else if (type === "mic") {
        if (this.audioTrack && this.audioTrack !== null) {
          await this.audioTrack.setDevice(config.microphoneId);
        }
      }
    } catch (error) {
      console.log("update device error: ", error);
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
