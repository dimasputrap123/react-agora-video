import AgoraRTC from "agora-rtc-sdk-ng";
import React, { Component } from "react";
import PropTypes from "prop-types";

class AGPublish extends Component {
  constructor(props) {
    super(props);
    this.videoTrack = null;
    this.audioTrack = null;
  }
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
    } else if (shouldUpdate("", undefined, "screenShare")) {
      this.switchCameraScreen(this.props.screenShare ? "screen" : "camera");
    }
  }

  init = async () => {
    const { client, publishVideo, publishAudio } = this.props;
    if (!client) {
      return;
    }
    if (publishVideo) {
      await this.createTrack("camera");
    }
    if (publishAudio) {
      await this.createTrack("mic");
    }
    await this.playAndPublish();
  };

  createTrack = async (type) => {
    const { onError, cameraConfig, micConfig, screenConfig } = this.props;
    let camOpt = { cameraId: "" };
    let micOpt = { microphoneId: "" };
    let scOpt = { optimizationMode: "detail" };
    if (cameraConfig && typeof cameraConfig === "object") {
      camOpt = { ...camOpt, ...cameraConfig };
    }
    if (micConfig && typeof micConfig === "object") {
      micOpt = { ...micOpt, ...micConfig };
    }
    if (screenConfig && typeof screenConfig === "object") {
      scOpt = { ...scOpt, ...screenConfig };
    }
    try {
      if (type === "camera") {
        this.videoTrack = await AgoraRTC.createCameraVideoTrack(camOpt);
      } else if (type === "mic") {
        this.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(micOpt);
      } else if (type === "screen") {
        this.videoTrack = await AgoraRTC.createScreenVideoTrack(scOpt);
      }
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError(error);
      }
    }
  };

  switchCameraScreen = async (type) => {
    const {
      client,
      onError,
      onScreenCancel,
      onScreenStop,
      publishVideo,
    } = this.props;
    try {
      if (this.videoTrack !== null) {
        await client.unpublish(this.videoTrack);
      }
      this.clearTrack("camera");
      if (type === "camera" && publishVideo) {
        await this.createTrack("camera");
      } else if (type === "screen") {
        await this.createTrack("screen");
      }
      this.playAndPublish(type);
      if (type === "screen") {
        this.videoTrack.once("track-ended", () => {
          if (onScreenStop && typeof onScreenStop === "function")
            onScreenStop();
        });
      }
    } catch (error) {
      if (type === "screen") {
        if (onScreenCancel && typeof onScreenCancel === "function") {
          onScreenCancel();
        }
      }
      if (onError && typeof onError === "function") {
        onError(error);
      }
    }
  };

  setEnabled = async (type, value) => {
    const { onError } = this.props;
    try {
      if (type === "camera") {
        if (this.videoTrack === null) {
          await this.createTrack("camera");
          await this.playAndPublish("camera");
        }
        await this.videoTrack.setEnabled(value);
      } else {
        if (this.audioTrack === null) {
          await this.createTrack("mic");
          await this.playAndPublish("mic");
        }
        await this.audioTrack.setEnabled(value);
      }
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError(error);
      }
    }
  };

  updateTrack = async ({ type, updateType, config }) => {
    const { onError } = this.props;
    try {
      if (type === "camera") {
        if (this.videoTrack !== null) {
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
        onError(error);
      }
    }
  };

  updateAudioTrack = async () => {
    const { client, onError, publishAudio } = this.props;
    if (client) {
      try {
        if (this.audioTrack !== null) {
          await client.unpublish(this.audioTrack);
        }
        if (publishAudio) {
          await this.createTrack("mic");
          await client.publish(this.audioTrack);
        }
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError(error);
        }
      }
    }
  };

  playAndPublish = async (type = "") => {
    const {
      container,
      client,
      onError,
      publishAudio,
      publishVideo,
    } = this.props;
    if (this.videoTrack !== null) {
      if (!this.videoTrack.isPlaying) {
        this.videoTrack.play(container || "local_container");
      }
    }
    if (client) {
      try {
        if (type === "" && publishAudio && publishVideo) {
          await client.publish([this.videoTrack, this.audioTrack]);
        } else if ((type === "camera" && publishVideo) || type === "screen") {
          await client.publish(this.videoTrack);
        } else if (type === "mic" && publishAudio) {
          await client.publish(this.audioTrack);
        }
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError(error);
        }
      }
    }
  };

  clearTrack = (type = "") => {
    if (this.videoTrack !== null && (type === "" || type === "camera")) {
      this.videoTrack.stop();
      this.videoTrack.close();
      this.videoTrack = null;
    }
    if (this.audioTrack !== null && (type === "" || type === "mic")) {
      this.audioTrack.stop();
      this.audioTrack.close();
      this.audioTrack = null;
    }
  };

  render() {
    return (
      !this.props.container && (
        <div className={this.props.containerClass} id="local_container"></div>
      )
    );
  }
}

AGPublish.propTypes = {
  client: PropTypes.object,
  onUnpublish: PropTypes.func,
  onScreenCancel: PropTypes.func,
  onScreenStop: PropTypes.func,
  onError: PropTypes.func,
  container: PropTypes.string,
  containerClass: PropTypes.string,
  cameraConfig: PropTypes.object,
  micConfig: PropTypes.object,
  screenConfig: PropTypes.object,
  publishVideo: PropTypes.bool,
  publishAudio: PropTypes.bool,
  screenShare: PropTypes.bool,
};

AGPublish.defaultProps = {
  publishAudio: true,
  publishVideo: true,
  screenShare: false,
  screenConfig: {},
};

export default AGPublish;
