"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (allow, rejected) {
  return function (req, res, next) {
    const client = req.jscastClient;
    if (client) {
      if (!allow(client)) {
        rejected(client);
        return res.sendStatus(404);
      } else {
        next();
      }
    } else {
      throw new Error("no client object");
    }
  };
};