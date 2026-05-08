// Web shim for expo-font ExpoFontLoader - adds missing isLoaded() for Expo SDK 51 web
const _loaded = {};
export default {
  loadAsync(name, resource) {
    return new Promise((resolve) => {
      const url = typeof resource === 'string' ? resource : (resource && resource.uri ? resource.uri : null);
      if (!url) { _loaded[name] = true; return resolve(); }
      const style = document.createElement('style');
      style.textContent = "@font-face{font-family:'" + name + "';src:url('" + url + "')}";
      document.head.appendChild(style);
      document.fonts.load('1em ' + name)
        .then(() => { _loaded[name] = true; resolve(); })
        .catch(() => { _loaded[name] = true; resolve(); });
    });
  },
  isLoaded(name) { return !!_loaded[name]; },
  unloadAllAsync() { return Promise.resolve(); },
  getLoadedFonts() { return Object.keys(_loaded); },
};
