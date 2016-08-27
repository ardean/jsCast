"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (req, res, next) {
  req.jscastClient = new _client2.default(req, res);
  next();
};

var _client = require("./client");

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }