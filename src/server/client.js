export default class Client {
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
