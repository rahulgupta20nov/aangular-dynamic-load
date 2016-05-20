/*! angular-Dynamic-Load */
(function() {

  var dynamicLoad = function(angular) {
    //Self-invoking anonymous function keeps global scope clean.

    //Register the module.
    //Getting angular onto the global scope is the client's responsibility.

    /**
     * Dynamic Load needs RequireJS in order to be useful.  However, it is not
     * necessary for your application to be bootstrapped using AMD.  You have
     * two options:
     *
     * #### A. Use Traditional &lt;script&gt; Tags
     *
     *  If you use traditional script tags to load the module (i.e. you aren't
     *  using AMD to structure your the non-lazy portion of your application,
     *  you **must** load the following three scripts in this order (other
     *  modules can be loaded wherever it makes sense for you, but these three
     *  must follow the order):
     *
     *   1. Angular
     *   2. Dynamic Load
     *   3. RequireJS
     *
     *    <pre>
     *   <!-- in index.html -->
     *   <script src="/js/angular.min.js"></script>
     *   <script src="/js/angular-Dynamic-Load.min.js"></script>
     *   <script src="/js/require.min.js"></script>
     *   </pre>
     *
     * #### B. Use RequireJS
     *
     *  If you use RequireJS, Dynamic Load will first try to use an AMD module
     *  that is defined with the name ```'angular'```.  If it does not find
     *  that, it will try to use an angular object defined as
     *  ```window.angular```.  This flexibility allows you to load angular
     *  from a script tag (if you do so before your require.js script tag)
     *  or from RequireJS -- the distinction will be critical if you are
     *  using multiple instances of angular (in which case I pity you for
     *  needing to, even though I understand that there are edge cases
     *  where it is necessary) -- it must be very painful.
     *
     */
    var module = angular.module('dynamic-ng-load', ['ng']);

    function dynamicLoadProvider(
      $controllerProvider,
      $compileProvider,
      $provide,
      $filterProvider
    ) {

      var rootScope = null;

      //Expose each provider's functionality as single-argument functions.
      //The component-definining functions that are passed as parameters
      //should bear their own names.  If apply is true, call apply on the
      //root scope.  This allows clients that are manually registering
      //components (outside of the promise-based methods) to force registration
      //to be applied, even if they are not doing so in an angular context.

      function registerValue(value, apply) {
        $provide.value.apply(null, value);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerConstant(value, apply) {
        $provide.value.apply(null, value);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerFactory(factory, apply) {
        $provide.factory.apply(null, factory);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerService(service, apply) {
        $provide.service.apply(null, service);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerFilter(filter, apply) {
        $filterProvider.register.apply(null, filter);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerDirective(directive, apply) {
        $compileProvider.directive.apply(null, directive);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerController(controller, apply) {
        $controllerProvider.register.apply(null, controller);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerDecorator(decorator, apply) {
        $provide.decorator.apply(null, decorator);
        if (apply) {
          rootScope.$apply();
        }
      }

      function registerProvider(service, apply) {
        $provide.provider.apply(null, service);
        if (apply) {
          rootScope.$apply();
        }
      }

      function resolve(dependencies, returnIndex, returnSubId) {
        if (dependencies.dependencies) {
          return resolveDependenciesProperty(
            dependencies,
            returnIndex,
            returnSubId
          );
        }
        else {
          return resolveDependencies(dependencies, returnIndex, returnSubId);
        }
      }
      this.resolve = resolve;

      function resolveDependencies(dependencies, returnIndex, returnSubId) {
        function delay($q, $rootScope) {

          var defer = $q.defer();

          require(dependencies, function() {
            var args = Array.prototype.slice(arguments);

            var out;

            if (returnIndex === undefined) {
              out = arguments[arguments.length - 1];
            }
            else {
              argForOut = arguments[returnIndex];
              if (returnSubId === undefined) {
                out = argForOut;
              }
              else {
                out = argForOut[returnSubId];
              }
            }

            defer.resolve(out);
            $rootScope.$apply();

          });

          return defer.promise;
        }

        delay.$inject = ['$q', '$rootScope'];
        return delay;

      }
      this.resolveDependencies = resolveDependencies;

      function resolveDependenciesProperty(configProperties) {
        if (configProperties.dependencies) {
          var resolveConfig = configProperties;
          var deps = configProperties.dependencies;
          delete resolveConfig.dependencies;

          resolveConfig.resolve = {};
          resolveConfig.resolve.delay = resolveDependencies(deps);
          return resolveConfig;
        }
        else
        {
          return configProperties;
        }

      }
      this.resolveDependenciesProperty = resolveDependenciesProperty;

      this.$get = function ($rootScope) {
        var svc = {};

        rootScope = $rootScope;

        svc.registerValue = registerValue;
        svc.registerConstant = registerConstant;
        svc.registerFactory = registerFactory;
        svc.registerService = registerService;
        svc.registerFilter = registerFilter;
        svc.registerDirective = registerDirective;
        svc.registerController = registerController;
        svc.registerDecorator = registerDecorator;
        svc.registerProvider = registerProvider;

        svc.resolveDependenciesProperty = resolveDependenciesProperty;
        svc.resolveDependencies = resolveDependencies;
        svc.resolve = resolve;

        return svc;
      };
      this.$get.$inject = ['$rootScope'];

    }
    dynamicLoadProvider.$inject = [
      '$controllerProvider',
      '$compileProvider',
      '$provide',
      '$filterProvider'
    ]; //inject the providers into dynamicLoadProvider

    module.provider('$dynamicLoad', dynamicLoadProvider);

    this.configureApp = function(app) {
      app.registerController = function(name, controller) {
        if (app.lazy) {
          app.lazy.registerController([name, controller]);
        }
        else {
          app.controller(name, controller);
        }
        return app;
      };

      app.registerFactory = function(name, factory) {
        if (app.lazy) {
          app.lazy.registerFactory([name, factory]);
        }
        else {
          app.factory(name, factory);
        }
        return app;
      };


      app.registerService = function(name, service) {
        if (app.lazy) {
          app.lazy.registerService([name, service]);
        }
        else {
          app.service(name, service);
        }
        return app;
      };

      app.registerDirective = function(name, directive) {
        if (app.lazy) {
          app.lazy.registerDirective([name, directive]);
        }
        else {
          app.directive(name, directive);
        }
        return app;
      };

      app.registerDecorator = function(name, decorator) {
        if (app.lazy) {
          app.lazy.registerDecorator([name, decorator]);
        }
        else {
          app.decorator(name, decorator);
        }
        return app;
      };

      app.registerProvider = function(name, provider) {
        if (app.lazy) {
          app.lazy.registerProvider([name, provider]);
        }
        else {
          app.provider(name, provider);
        }
        return app;
      };

      app.registerValue = function(name, value) {
        if (app.lazy) {
          app.lazy.registerValue([name, value]);
        }
        else {
          app.value(name, value);
        }
        return app;
      };

      app.registerConstant = function(name, value) {
        if (app.lazy) {
          app.lazy.registerConstant([name, value]);
        }
        else {
          app.constant(name, value);
        }
        return app;
      };


      app.registerFilter = function(name, filter) {
        if (app.lazy) {
          app.lazy.registerFilter([name, filter]);
        }
        else {
          app.filter(name, filter);
        }
        return app;
      };

      app.extendInjectable = function(parent, child) {

        // split up injections and constructor
        function disassembleInjected(object) {
          if (angular.isArray(object)) {
            var func = object.slice(object.length - 1)[0];
            return [func, object.slice(0, object.length - 1)];
          }
          else {
            var injections = object.$inject;
            return [object, injections || []];
          }
        }

        parentPieces = disassembleInjected(parent);
        childPieces = disassembleInjected(child);

        // combined  constructor.
        function CombinedConstructor() {
          var args = Array.prototype.slice.call(arguments);

          parentPieces[0].apply(this, args.slice(0, parentPieces[1].length));
          childPieces[0].apply(this, args.slice(parentPieces[1].length));
        }

        // combined object target
        function Inherit() {}
        // child's prototype will already be present
        Inherit.prototype = parentPieces[0].prototype;

        // instantiate it without calling constructor
        CombinedConstructor.prototype = new Inherit();

        // ask for everything.
        CombinedConstructor.$inject =
              [].concat(parentPieces[1]).concat(childPieces[1]);

        return CombinedConstructor;
      };


    };

  };
  
  if ( typeof(define) === 'function' && define.amd) {
    // expose Dynamic Load as an AMD module depending on 'angular'
    // since we use angular from window, apps are not required
    // to export the angular object from a shim.
    define(['angular'], function() { return new dynamicLoad(window.angular); });
  }
  else {
    window.dynamicLoad = new dynamicLoad(angular);
  }
}());
