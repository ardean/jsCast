"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Client {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.ip = req.ip;
    this.wantsMetadata = req.headers["icy-metadata"] === "1";
  }

  write(data) {
    this.res.write(data);
  }
}
exports.default = Client;