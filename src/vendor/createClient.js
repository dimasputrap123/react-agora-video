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

  let join = [];
  let publish = [];
  let uid = "";
  let client = null;

  client = AgoraRTC.createClient({ codec, mode, role });

  const userJoined = (user) => {
    const index = join.findIndex((e) => e.uid === user.uid);
    if (index < 0) {
      join.push(user);
      joinUpdated(join);
    }
  };

  const userLeft = (user, reason) => {
    const index = join.findIndex((e) => e.uid === user.uid);
    if (index < 0) {
      join.splice(index, 1);
      joinUpdated(join);
    }
  };

  const userPublished = (user, mediaType) => {
    const index = publish.findIndex((e) => e.uid === user.uid);
    if (index < 0) {
      publish.push({ user, mediaType });
      publishUpdated(publish);
    }
  };

  const userUnpublished = (user, mediaType) => {
    const index = publish.findIndex((e) => e.uid === user.uid);
    if (index < 0) {
      publish.splice(index, 1);
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
