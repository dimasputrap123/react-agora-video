import React from "react";

const FormSetting = ({ onSubmit, onLeave, onSelectChange, connectState }) => {
  const selectHandler = React.useCallback(
    (e) => {
      if (connectState) {
        onSelectChange(e.target.value, e.target.name);
      }
    },
    [connectState, onSelectChange]
  );
  React.useEffect(() => {
    document
      .getElementById("cameras")
      .addEventListener("change", selectHandler);
    document.getElementById("mics").addEventListener("change", selectHandler);
    return () => {
      document
        .getElementById("cameras")
        .removeEventListener("change", selectHandler);
      document
        .getElementById("mics")
        .removeEventListener("change", selectHandler);
    };
  }, [selectHandler]);
  React.useEffect(() => {
    getDevices();
  }, []);
  const getDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((e) => {
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
        <select className="form-control" id="cameras" name="camera"></select>
      </div>
      <div className="form-group">
        <label>Microphone</label>
        <select className="form-control" id="mics" name="mic"></select>
      </div>
      <div className="d-flex mb-3">
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
      <button type="button" className="btn btn-info btn-block" id="screenBtn">
        Sharescreen
      </button>
    </form>
  );
};

export default FormSetting;
