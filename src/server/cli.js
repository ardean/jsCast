import ip from "ip";
import geoip from "geoip-lite";
import program from "commander";
import pkg from "../../package";
import Server from "./";
import Storage from "../storage";

const storageTypeNames = Storage.getTypeNames();

program
  .version(pkg.version)
  .option("-p, --port [port]", "sets server port", parseInt)
  .option("-c, --country [country]", "allow specific country only e.g. US")
  .option("--storageType [storageType]", "use storage type, builtin types: " + storageTypeNames.join(", "))
  .parse(process.argv);

new Server({
  storageType: program.storageType,
  allow: (client) => {
    if (ip.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
    if (program.country) {
      const geo = geoip.lookup(client.ip);
      return geo && geo.country === program.country;
    } else {
      return true;
    }
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
}).start(program.port, (server) => {
  console.log(`jscast server is running`);
  console.log(`listen on http://localhost:${server.port}/`);
  console.log(`manage on http://localhost:${server.port}/manage`);
});
