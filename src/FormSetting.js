import AgoraRTC from "agora-rtc-sdk-ng";
import React from "react";

const FormSetting = ({
  onSubmit,
  onLeave,
  onSelectChange,
  connectState,
  onScreen,
}) => {
  const videoProfiles = [
    { label: "480p_1", detail: "640×480, 15fps, 500Kbps", value: "480p_1" },
    { label: "480p_2", detail: "640×480, 30fps, 1000Kbps", value: "480p_2" },
    { label: "720p_1", detail: "1280×720, 15fps, 1130Kbps", value: "720p_1" },
    { label: "720p_2", detail: "1280×720, 30fps, 2000Kbps", value: "720p_2" },
    {
      label: "1080p_1",
      detail: "1920×1080, 15fps, 2080Kbps",
      value: "1080p_1",
    },
    {
      label: "1080p_2",
      detail: "1920×1080, 30fps, 3000Kbps",
      value: "1080p_2",
    },
    {
      label: "200×640",
      detail: "200×640, 30fps",
      value: { width: 200, height: 640, frameRate: 30 },
    }, // custom video profile
  ];
  const audioProfiles = [
    { label: "speech low quality", value: "speech_low_quality" },
    { label: "speech standard", value: "speech_standard" },
    { label: "music standard", value: "music_standard" },
    { label: "standard stereo", value: "standard_stereo" },
    { label: "high quality", value: "high_quality" },
    { label: "high quality stereo", value: "high_quality_stereo" },
  ];
  const screenProfiles = [
    { label: "640 × 480", value: "480p_2" },
    { label: "1280 × 720", value: "720p_2" },
    { label: "1920 × 1080", value: "1080p_2" },
  ];
  const selectHandler = React.useCallback(
    (e) => {
      if (connectState) {
        onSelectChange(
          e.target.name === "publishVideo" || e.target.name === "publishAudio"
            ? e.target.checked
            : e.target.value,
          e.target.name
        );
      }
    },
    [connectState, onSelectChange]
  );
  const setProfiling = () => {
    const profile = document.getElementById("profile");
    const audioProfile = document.getElementById("audioProfile");
    const screenProfile = document.getElementById("screenProfile");
    videoProfiles.forEach((el) => {
      let opt = document.createElement("OPTION");
      opt.innerHTML = el.detail;
      opt.value = el.value;
      profile.append(opt);
    });
    audioProfiles.forEach((el) => {
      let opt = document.createElement("OPTION");
      opt.innerHTML = el.label;
      opt.value = el.value;
      audioProfile.append(opt);
    });
    screenProfiles.forEach((el) => {
      let opt = document.createElement("OPTION");
      opt.innerHTML = el.label;
      opt.value = el.value;
      screenProfile.append(opt);
    });
  };
  React.useEffect(() => {
    setProfiling();
    getDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getDevices = () => {
    AgoraRTC.getDevices().then((e) => {
      const cameras = document.getElementById("cameras");
      const mics = document.getElementById("mics");
      e.forEach((device) => {
        const elm = document.createElement("OPTION");
        elm.value = device.deviceId;
        elm.innerHTML = device.label;
        if (device.kind === "videoinput") {
          cameras.append(elm);
        } else if (device.kind === "audioinput") {
          mics.append(elm);
        }
      });
    });
  };
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>AppId</label>
        <input type="text" name="appid" className="form-control" />
      </div>
      <div className="form-group">
        <label>Token</label>
        <input type="text" name="token" className="form-control" />
      </div>
      <div className="form-group">
        <label>Channel</label>
        <input type="text" name="channel" className="form-control" />
      </div>
      <div className="form-group">
        <label>Camera</label>
        <select onChange={selectHandler} className="form-control" id="cameras" name="camera"></select>
      </div>
      <div className="form-group">
        <label>Microphone</label>
        <select onChange={selectHandler} className="form-control" id="mics" name="mic"></select>
      </div>
      <div className="form-group">
        <label>Video Profile</label>
        <select onChange={selectHandler} className="form-control" id="profile" name="profile"></select>
      </div>
      <div className="form-group">
        <label>Audio Profile</label>
        <select
          className="form-control"
          id="audioProfile"
          name="audioProfile"
          onChange={selectHandler}
        ></select>
      </div>
      <div className="form-group">
        <label>Screen Profile</label>
        <select
          className="form-control"
          id="screenProfile"
          name="screenProfile"
        ></select>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="checkbox"
          id="publishVideo"
          name="publishVideo"
          onChange={selectHandler}
        />
        <label className="form-check-label">Camera</label>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="checkbox"
          id="publishAudio"
          name="publishAudio"
          onChange={selectHandler}
        />
        <label className="form-check-label">Microphone</label>
      </div>
      <div className="d-flex mb-3 mt-3">
        <button type="submit" className="btn btn-primary mr-3 flex-fill">
          Join
        </button>
        <button
          type="button"
          className="btn btn-secondary flex-fill"
          onClick={onLeave}
        >
          Leave
        </button>
      </div>
      <button
        type="button"
        onClick={onScreen}
        className="btn btn-info btn-block"
        id="screenBtn"
      >
        Sharescreen
      </button>
    </form>
  );
};

export default FormSetting;
