import Client from "./";

export default function (req, res, next) {
  req.jscastClient = new Client(req, res);
  next();
}
