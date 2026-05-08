"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const _loaded = {};
const ExpoFontLoader = {
  loadAsync: function(name, resource) {
    return new Promise(function(resolve) {
      var url = typeof resource === "string" ? resource : (resource && resource.uri ? resource.uri : null);
      if (!url) { _loaded[name] = true; return resolve(); }
      var style = document.createElement("style");
      style.textContent = "@font-face{font-family:" + name + ";src:url(" + url + ")}";
      document.head.appendChild(style);
      document.fonts.load("1em " + name).then(function() { _loaded[name] = true; resolve(); }).catch(function() { _loaded[name] = true; resolve(); });
    });
  },
  isLoaded: function(name) { return !!_loaded[name]; },
  unloadAllAsync: function() { return Promise.resolve(); },
  getLoadedFonts: function() { return Object.keys(_loaded); }
};
exports.default = ExpoFontLoader;
