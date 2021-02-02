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
    this.reSubs();
  }

  reSubs = () => {
    const { video, audio, user } = this.props.remoteData;
    if (video && user.videoTrack === undefined) {
      this.subsRemote("video");
    } else if (audio && user.audioTrack === undefined) {
      this.subsRemote("audio");
    }
  };

  subsRemote = async (type) => {
    const { client, remoteData, onError, container } = this.props;
    try {
      await client.subscribe(remoteData.user, type);
      console.log("remote", remoteData.user);
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
  };

  render() {
    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className={this.props.containerClass}
      ></div>
    );
  }
}

export default AGRemote;
