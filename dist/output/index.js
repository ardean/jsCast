"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _icyServer = require("./types/icy-server");

var _icyServer2 = _interopRequireDefault(_icyServer);

var _speaker = require("./types/speaker");

var _speaker2 = _interopRequireDefault(_speaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typePluginMap = {};

class OutputManager {
  constructor(options) {
    options = options || {};

    this.types = options.types || ["IcyServer", "Speaker"];
    if (this.types.length < 1) throw new Error("No output types");

    this.typePlugins = this.types.map(type => OutputManager.getType(type));
  }

  activate(options) {
    options = options || {};

    const promises = this.typePlugins.map(typePlugin => {
      const pluginOptions = options[typePlugin.typeName] || {};
      pluginOptions.app = pluginOptions.app || options.app;
      pluginOptions.socket = pluginOptions.socket || options.socket;
      pluginOptions.port = pluginOptions.port || options.port;
      pluginOptions.station = pluginOptions.station || options.station;
      pluginOptions.outputManager = pluginOptions.outputManager || options.outputManager || this;

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

exports.default = OutputManager;
OutputManager.registerType("IcyServer", new _icyServer2.default());
OutputManager.registerType("Speaker", new _speaker2.default());