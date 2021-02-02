import AgoraRTC from "agora-rtc-sdk-ng";

export default function createClient({
  codec,
  mode,
  role,
  joinUpdated,
  publishUpdated,
  events,
  appid,
  channel,
  token,
  onError,
} = {}) {
  if (!appid) {
    throw new Error("missing AppId");
  }
  if (!channel) {
    throw new Error("missing channel");
  }
  if (!token) {
    throw new Error("missing token");
  }
  if (!codec) {
    throw new Error("missing codec");
  }
  if (!mode) {
    throw new Error("missing mode");
  }
  if (mode === "rtc" && role) {
    throw new Error("mode must be live");
  }

  let join = {};
  let publish = {};
  let uid = "";
  let client = null;

  client = AgoraRTC.createClient({ codec, mode, role });

  const userJoined = (user) => {
    if (!join.hasOwnProperty(user.uid)) {
      join = { ...join, [user.uid]: user };
      joinUpdated(Object.values(join));
    }
  };

  const userLeft = (user, reason) => {
    if (join.hasOwnProperty(user.uid)) {
      delete join[user.uid];
      delete publish[user.uid];
      joinUpdated(Object.values(join));
      publishUpdated(publish);
    }
  };

  const userPublished = (user, mediaType) => {
    if (!publish.hasOwnProperty(user.uid)) {
      publish = {
        ...publish,
        [user.uid]: { user, audio: false, video: false },
      };
    }
    if (publish.hasOwnProperty(user.uid)) {
      if (mediaType === "video") {
        publish[user.uid].video = true;
      } else if (mediaType === "audio") {
        publish[user.uid].audio = true;
      }
      publishUpdated(publish);
    }
  };

  const userUnpublished = (user, mediaType) => {
    if (publish.hasOwnProperty(user.uid)) {
      if (publish[user.uid].video || publish[user.uid].audio) {
        if (mediaType === "video") {
          publish[user.uid].video = false;
        } else {
          publish[user.uid].audio = false;
        }
      } else {
        delete publish[user.uid];
      }
      publishUpdated(publish);
    }
  };

  client.on("user-joined", userJoined);
  client.on("user-left", userLeft);
  client.on("user-published", userPublished);
  client.on("user-unpublished", userUnpublished);

  if (events && Array.isArray(events)) {
    events.forEach((e) => {
      client.on(e.event, e.handler);
    });
  }

  client
    .join(appid, channel, token)
    .then((e) => {
      uid = e;
    })
    .catch((err) => {
      if (onError && typeof onError === "function") {
        onError(err);
      }
    });

  return {
    client,
    uid,
    disconnect: async () => {
      if (client !== null) {
        try {
          await client.leave();
          client.removeAllListeners();
          return true;
        } catch (error) {
          throw error;
        }
      }
    },
  };
}
