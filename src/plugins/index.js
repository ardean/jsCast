import ManageType from "./manage";
import IcyServerType from "./icy-server";
import SpeakerType from "./speaker";

const typePluginMap = {};

export default class PluginManager {
  constructor(options) {
    options = options || {};

    this.types = options.types || ["Manage", "IcyServer", "Speaker"];
    this.typePlugins = this.types.map((type) => PluginManager.getType(type));
  }

  activate(options) {
    options = options || {};

    const promises = this.typePlugins.map((typePlugin) => {
      const pluginOptions = options[typePlugin.typeName] || {};
      pluginOptions.app = pluginOptions.app || options.app;
      pluginOptions.socket = pluginOptions.socket || options.socket;
      pluginOptions.port = pluginOptions.port || options.port;
      pluginOptions.station = pluginOptions.station || options.station;

      return Promise
        .resolve(typePlugin.activate(pluginOptions))
        .then(() => {
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

    return Promise
      .all(promises)
      .then(() => {
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

PluginManager.registerType("Manage", new ManageType());
PluginManager.registerType("IcyServer", new IcyServerType());
PluginManager.registerType("Speaker", new SpeakerType());
