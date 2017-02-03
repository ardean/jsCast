import EventEmitter from "events";
const io = window.io;

class Connection extends EventEmitter {
  constructor() {
    super();

    this.socket = io(location.host, {
      path: location.pathname + "sockets"
    });

    this.socket
      .on("connect", () => {
        this.isConnected = true;
        this.emit("connect");
      })
      .on("disconnect", () => {
        this.isConnected = false;
        this.emit("disconnect");
      });
  }
}

export default new Connection();
