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
      const previous = cast(
        key === "" ? prevProps[name] : prevProps[name][key],
        defaultValue
      );
      const current = cast(
        key === "" ? this.props[name] : this.props[name][key],
        defaultValue
      );
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
    } else if (shouldUpdate("encoderConfig", undefined, "micConfig")) {
      this.updateTrack({
        type: "mic",
        config: this.props.micConfig,
        updateType: "encoderConfig",
      });
    } else if (shouldUpdate("", undefined, "publishVideo")) {
      this.setEnabled("camera", this.props.publishVideo);
    } else if (shouldUpdate("", undefined, "publishAudio")) {
      this.setEnabled("mic", this.props.publishAudio);
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
    const { onError, cameraConfig, micConfig } = this.props;
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
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError("track", error);
      }
    }
  };

  setEnabled = async (type, value) => {
    const { onError } = this.props;
    try {
      if (type === "camera") {
        await this.videoTrack.setEnabled(value);
      } else {
        await this.audioTrack.setEnabled(value);
      }
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError("trackState", error);
      }
    }
  };

  updateTrack = async ({ type, updateType, config }) => {
    const { onError } = this.props;
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
          if (updateType === "encoderConfig") {
            this.updateAudioTrack();
          } else {
            await this.audioTrack.setDevice(config.microphoneId);
          }
        }
      }
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError("updateTrack", error);
      }
    }
  };

  updateAudioTrack = async () => {
    const { client, micConfig, onError } = this.props;
    if (client) {
      try {
        await client.unpublish(this.audioTrack);
        this.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
        await client.publish(this.audioTrack);
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError("updateAudioTrack", error);
        }
      }
    }
  };

  playAndPublish = async () => {
    const {
      container,
      client,
      onError,
      publishAudio,
      publishVideo,
    } = this.props;
    this.videoTrack.play(container || "local_container", {
      fit: "cover",
      mirror: true,
    });
    if (client) {
      try {
        if (publishAudio && publishVideo) {
          await client.publish([this.videoTrack, this.audioTrack]);
        } else if (publishVideo) {
          await this.audioTrack.setEnabled(false);
          await client.publish(this.videoTrack);
        } else if (publishAudio) {
          await this.videoTrack.setEnabled(false);
          await client.publish(this.audioTrack);
        } else {
          await this.videoTrack.setEnabled(false);
          await this.audioTrack.setEnabled(false);
        }
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError("publish", error);
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
  onError: PropTypes.func,
  container: PropTypes.string,
  camera: PropTypes.string,
  mic: PropTypes.string,
  screenConfig: PropTypes.object,
  publishVideo: PropTypes.bool,
  publishAudio: PropTypes.bool,
};

AGPublish.defaultProps = {
  publishAudio: true,
  publishVideo: true,
};

export default AGPublish;
