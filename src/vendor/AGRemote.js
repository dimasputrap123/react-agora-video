import React, { Component } from "react";
import PropTypes from "prop-types";

export class AGRemote extends Component {
  static propTypes = {
    client: PropTypes.object,
    remoteData: PropTypes.object,
    onError: PropTypes.func,
    containerClass: PropTypes.string,
    container: PropTypes.string,
  };

  componentDidMount() {
    this.reSubs();
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
    if (shouldUpdate("", undefined, "subscribeVideo")) {
      this.controlSubs("video");
    } else if (shouldUpdate("", undefined, "subscribeAudio")) {
      this.controlSubs("audio");
    }
    this.reSubs();
  }

  controlSubs = (type) => {
    const { subscribeVideo, subscribeAudio } = this.props;
    if (type === "video") {
      if (subscribeVideo) {
        this.subsRemote(type);
      } else {
        this.unSubsRemote(type);
      }
    } else if (type === "audio") {
      if (subscribeAudio) {
        this.subsRemote(type);
      } else {
        this.unSubsRemote(type);
      }
    }
  };

  reSubs = () => {
    const { subscribeVideo, subscribeAudio, remoteData } = this.props;
    const { video, audio, user } = remoteData;
    if (video && user.videoTrack === undefined && subscribeVideo) {
      this.subsRemote("video");
    }
    if (audio && user.audioTrack === undefined && subscribeAudio) {
      this.subsRemote("audio");
    }
  };

  subsRemote = async (type) => {
    const { client, remoteData, onError, container } = this.props;
    if (remoteData[type] && client.connectionState !== "DISCONNECTED") {
      try {
        await client.subscribe(remoteData.user, type);
        if (type === "video") {
          if (container) {
            remoteData.user.videoTrack.play(container);
          } else {
            this.node.id = `remote-${remoteData.user.uid}`;
            remoteData.user.videoTrack.play(`remote-${remoteData.user.uid}`);
          }
        } else if (type === "audio") {
          remoteData.user.audioTrack.play();
        }
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError(error);
        }
      }
    }
  };

  unSubsRemote = async (type) => {
    const { client, remoteData, onError } = this.props;
    try {
      if (remoteData[type]) {
        console.log("unsubs test");
        await client.unsubscribe(remoteData.user, type);
      }
    } catch (error) {
      if (onError && typeof onError === "function") {
        onError(error);
      }
    }
  };

  render() {
    return (
      !this.props.container && (
        <div
          ref={(node) => {
            this.node = node;
          }}
          className={this.props.containerClass}
        ></div>
      )
    );
  }
}

export default AGRemote;
