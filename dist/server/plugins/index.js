"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webClient = require("./web-client");

var _webClient2 = _interopRequireDefault(_webClient);

var _icyServer = require("./icy-server");

var _icyServer2 = _interopRequireDefault(_icyServer);

var _speaker = require("./speaker");

var _speaker2 = _interopRequireDefault(_speaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typePluginMap = {};

class PluginManager {
  constructor(options) {
    options = options || {};

    this.types = options.types || ["WebClient", "IcyServer", "Speaker"];
    this.typePlugins = this.types.map(type => PluginManager.getType(type));
  }

  activate(options) {
    options = options || {};

    const promises = this.typePlugins.map(typePlugin => {
      const pluginOptions = options[typePlugin.typeName] || {};
      pluginOptions.app = pluginOptions.app || options.app;
      pluginOptions.socket = pluginOptions.socket || options.socket;
      pluginOptions.port = pluginOptions.port || options.port;
      pluginOptions.station = pluginOptions.station || options.station;

      return Promise.resolve(typePlugin.activate(pluginOptions)).then(() => {
        if (typePlugin.app) {
          pluginOptions.app = pluginOptions.app || typePlugin.app;
          options.app = pluginOptions.app;
        }

        if (typePlugin.socket) {
          pluginOptions.socket = pluginOptions.socket || typePlugin.socket;
          options.socket = pluginOptions.socket;
        }
      });
    });

    return Promise.all(promises).then(() => {
      return options;
    });
  }

  isActive(type) {
    return this.types.indexOf(type) > -1;
  }

  getActiveType(type) {
    return this.isActive(type) && PluginManager.getType(type);
  }

  static registerType(type, typePlugin) {
    typePlugin.typeName = type;
    typePluginMap[type] = typePlugin;
  }

  static getType(type) {
    return typePluginMap[type];
  }

  static getTypeNames() {
    return Object.keys(typePluginMap);
  }
}

exports.default = PluginManager;
PluginManager.registerType("WebClient", new _webClient2.default());
PluginManager.registerType("IcyServer", new _icyServer2.default());
PluginManager.registerType("Speaker", new _speaker2.default());