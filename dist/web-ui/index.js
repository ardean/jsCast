"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manage = require("./types/manage");

var _manage2 = _interopRequireDefault(_manage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typePluginMap = {};

class WebUI {
  constructor(options) {
    options = options || {};

    this.types = options.types || ["Manage"];
    if (this.types.length < 1) throw new Error("No output types");

    this.typePlugins = this.types.map(type => WebUI.getType(type));
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

exports.default = WebUI;
WebUI.registerType("Manage", new _manage2.default());