import Server from "../src";
import geoip from "geoip-lite";
import ip from "ip";

const mapYouTube = function (url) {
  return {
    type: "YouTube",
    options: {
      url: url
    }
  };
};

const germanPlaylist = [
  "https://www.youtube.com/watch?v=6S1Yupk77pA",
  "https://www.youtube.com/watch?v=4rRYqtehPk8",
  "https://www.youtube.com/watch?v=RZ6O4yvgQ3U",
  "https://www.youtube.com/watch?v=ntoqc6hFkhE",
  "https://www.youtube.com/watch?v=LUlZ5n0cyak",
  "https://www.youtube.com/watch?v=mJbJDqEJ6Iw",
  "https://www.youtube.com/watch?v=BoX5U8rAsNA",
  "https://www.youtube.com/watch?v=8nSPcxPR-6I",
  "https://www.youtube.com/watch?v=uDe-EdAEKvw",
  "https://www.youtube.com/watch?v=YO1GBsuzTWU"
].map(mapYouTube);

const yogscastPlaylist = [
  "https://www.youtube.com/watch?v=99dM8__wphY",
  "https://www.youtube.com/watch?v=gqELqRCnW6g",
  "https://www.youtube.com/watch?v=D67jM8nO7Ag",
  "https://www.youtube.com/watch?v=kzeeV_Dl9gw",
  "https://www.youtube.com/watch?v=PWZylTw6RGY",
  "https://www.youtube.com/watch?v=ytWz0qVvBZ0",
  "https://www.youtube.com/watch?v=qOVLUiha1B8"
].map(mapYouTube);

const suicidePlaylist = [
  "https://www.youtube.com/watch?v=7S8t_LfA3y0"
].map(mapYouTube);

new Server({
  storageType: "JSON",
  playlists: [
    // yogscastPlaylist,
    // germanPlaylist,
    // suicidePlaylist
  ],
  allow: (client) => {
    if (ip.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
    const geo = geoip.lookup(client.ip);
    return geo && geo.country === "CH";
  }
}).on("error", (err) => {
  console.log(err);
}).on("nothingToPlay", (playlist) => {
  if (!playlist) {
    console.log("no playlist");
  } else {
    console.log("playlist is empty");
  }
}).on("play", (item, metadata) => {
  console.log(`playing ${metadata.options.StreamTitle}`);
}).on("clientRejected", (client) => {
  console.log(`client ${client.ip} rejected`);
}).on("clientConnect", (client) => {
  console.log(`client ${client.ip} connected`);
}).on("clientDisconnect", (client) => {
  console.log(`client ${client.ip} disconnected`);
}).start((server) => {
  console.log(`jscast server is running`);
  console.log(`listen on http://localhost:${server.port}/`);
  console.log(`manage on http://localhost:${server.port}/manage`);
});
