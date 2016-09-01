"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (req, res, next) {
  req.jscastClient = new _2.default(req, res);
  next();
};

var _ = require("./");

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }