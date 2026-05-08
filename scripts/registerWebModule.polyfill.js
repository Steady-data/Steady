// registerWebModule polyfill for expo-modules-core
// Injected at the start of the Metro bundle to fix blank screen on web
// Uses Object.defineProperty with configurable:true so modules can redefine it
(function(){
  var d = globalThis.__d;
  if (d && !globalThis.__rwm) {
    globalThis.__rwm = 1;
    globalThis.__d = function(factory, id, deps) {
      d(function(g, r, i, a, m, exports, t) {
        factory(g, r, i, a, m, exports, t);
        if (exports && !exports.registerWebModule) {
          Object.defineProperty(exports, 'registerWebModule', {
            configurable: true,
            writable: true,
            enumerable: true,
            value: function(cls) { return cls; }
          });
        }
      }, id, deps);
    };
  }
})();
