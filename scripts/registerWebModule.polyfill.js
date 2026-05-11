// registerWebModule polyfill for expo-modules-core
// Injected at the start of the Metro bundle to fix blank screen on web
// Wraps Object.defineProperty to ensure registerWebModule is always configurable,
// preventing "Cannot redefine property: registerWebModule" TypeError
(function(){
    // Patch Object.defineProperty so registerWebModule is always configurable/writable
    var origDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, desc) {
        if (prop === 'registerWebModule' && desc && !desc.configurable) {
            desc = Object.assign({}, desc, { configurable: true, writable: true });
        }
        return origDefineProperty.call(this, obj, prop, desc);
    };

    var d = globalThis.__d;
    if (d && !globalThis.__rwm) {
        globalThis.__rwm = 1;
        globalThis.__d = function(factoryId, moduleFactory, deps) {
            var factoryWrapper = function(global, required, module, exports) {
                if (!exports.registerWebModule) {
                    exports.registerWebModule = function(cls) { return cls; };
                }
                moduleFactory(global, required, module, exports);
            };
            d(factoryId, factoryWrapper, deps);
        };
    }
}());
