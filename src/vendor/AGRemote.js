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

    const shouldUpdate = (defaultValue, name) => {
      const previous = cast(prevProps[name], defaultValue);
      const current = cast(this.props[name], defaultValue);
      return previous !== current;
    };
    if (shouldUpdate(undefined, "subscribeVideo")) {
      this.controlSubs("video");
    } else if (shouldUpdate(undefined, "subscribeAudio")) {
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
    if (remoteData[type]) {
      try {
        await client.subscribe(remoteData.user, type);
        if (type === "video") {
          if (container) {
            remoteData.user.videoTrack.play(container, {
              mirror: true,
              fit: "cover",
            });
          } else {
            this.node.id = `remote-${remoteData.user.uid}`;
            remoteData.user.videoTrack.play(`remote-${remoteData.user.uid}`, {
              mirror: true,
              fit: "cover",
            });
          }
        } else if (type === "audio") {
          remoteData.user.audioTrack.play();
        }
      } catch (error) {
        if (onError && typeof onError === "function") {
          onError("subsErr", error);
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
        onError("unsubsErr", error);
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
