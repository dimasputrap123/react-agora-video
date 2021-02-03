import React from "react";
import { AGRemote } from "./vendor";

const Remote = ({ uid, remote, client, remoteError }) => {
  const [state, setState] = React.useState({
    subscribeVideo: true,
    subscribeAudio: true,
  });
  const { subscribeVideo, subscribeAudio } = state;
  const handleClick = ({ target: { name } }) => {
    setState((state) => ({ ...state, [name]: !state[name] }));
  };
  return (
    <div id={`remote-${uid}`} className="video position-relative remote">
      {remote.hasOwnProperty(uid) ? (
        <>
          <AGRemote
            subscribeVideo={subscribeVideo}
            subscribeAudio={subscribeAudio}
            client={client}
            remoteData={remote[uid]}
            container={`remote-${uid}`}
            onError={remoteError}
          />
          <div
            className="control"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 1,
            }}
          >
            <button
              className={`btn ${
                subscribeVideo ? "btn-primary" : "btn-secondary"
              } mr-2`}
              name="subscribeVideo"
              onClick={handleClick}
            >
              video
            </button>
            <button
              className={`btn ${
                subscribeAudio ? "btn-primary" : "btn-secondary"
              } mr-2`}
              name="subscribeAudio"
              onClick={handleClick}
            >
              audio
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Remote;
