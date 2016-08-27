"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
  function Client(req, res) {
    _classCallCheck(this, Client);

    this.req = req;
    this.res = res;
    this.ip = req.ip;
    this.wantsMetadata = req.headers["icy-metadata"] === "1";
  }

  _createClass(Client, [{
    key: "write",
    value: function write(data) {
      this.res.write(data);
    }
  }]);

  return Client;
}();

exports.default = Client;