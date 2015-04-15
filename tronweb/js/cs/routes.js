(function() {
  var MainView, module;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.modules = window.modules || {};
  module = window.modules.routes = {};
  module.TronRoutes = (function() {
    __extends(TronRoutes, Backbone.Router);
    function TronRoutes() {
      TronRoutes.__super__.constructor.apply(this, arguments);
    }
    TronRoutes.prototype.routes = {
      "": "index",
      "home(;*params)": "home",
      "dashboard(;*params)": "dashboard",
      "jobs(;*params)": "jobs",
      "job/:name": "job",
      "job/:job_name/:run_num": "jobrun",
      "job/:name/:run/:action": "actionrun",
      "services(;*params)": "services",
      "service/:name": "service",
      "configs": "configs",
      "config/:name": "config"
    };
    TronRoutes.prototype.updateMainView = function(model, viewType) {
      var view;
      view = new viewType({
        model: model
      });
      model.fetch();
      return mainView.updateMain(view);
    };
    TronRoutes.prototype.index = function() {
      return this.navigate('home', {
        trigger: true
      });
    };
    TronRoutes.prototype.home = function(params) {
      var model;
      model = new Dashboard({
        filterModel: new DashboardFilterModel(module.getParamsMap(params))
      });
      return this.updateMainView(model, DashboardView);
    };
    TronRoutes.prototype.dashboard = function(params) {
      var dashboard, model;
      mainView.close();
      model = new Dashboard({
        filterModel: new DashboardFilterModel(module.getParamsMap(params))
      });
      dashboard = new DashboardView({
        model: model
      });
      model.fetch();
      return mainView.updateFullView(dashboard.render());
    };
    TronRoutes.prototype.configs = function() {
      return this.updateMainView(new NamespaceList(), NamespaceListView);
    };
    TronRoutes.prototype.config = function(name) {
      return this.updateMainView(new Config({
        name: name
      }), ConfigView);
    };
    TronRoutes.prototype.services = function(params) {
      var collection;
      collection = new ServiceCollection([], {
        refreshModel: new RefreshModel(),
        filterModel: new FilterModel(module.getParamsMap(params))
      });
      return this.updateMainView(collection, ServiceListView);
    };
    TronRoutes.prototype.service = function(name) {
      var refreshModel;
      refreshModel = new RefreshModel();
      return this.updateMainView(new Service({
        name: name,
        refreshModel: refreshModel
      }), ServiceView);
    };
    TronRoutes.prototype.jobs = function(params) {
      var collection;
      collection = new JobCollection([], {
        refreshModel: new RefreshModel(),
        filterModel: new JobListFilterModel(module.getParamsMap(params))
      });
      return this.updateMainView(collection, JobListView);
    };
    TronRoutes.prototype.job = function(name) {
      var refreshModel;
      refreshModel = new RefreshModel();
      return this.updateMainView(new Job({
        name: name,
        refreshModel: refreshModel
      }), JobView);
    };
    TronRoutes.prototype.jobrun = function(name, run) {
      var model;
      model = new JobRun({
        name: name,
        run_num: run,
        refreshModel: new RefreshModel()
      });
      return this.updateMainView(model, JobRunView);
    };
    TronRoutes.prototype.actionrun = function(name, run, action) {
      var historyCollection, model, view;
      model = new modules.actionrun.ActionRun({
        job_name: name,
        run_num: run,
        action_name: action,
        refreshModel: new RefreshModel()
      });
      historyCollection = new modules.actionrun.ActionRunHistory([], {
        job_name: name,
        action_name: action
      });
      view = new modules.actionrun.ActionRunView({
        model: model,
        history: historyCollection
      });
      model.fetch();
      historyCollection.fetch();
      return mainView.updateMain(view);
    };
    return TronRoutes;
  })();
  MainView = (function() {
    __extends(MainView, Backbone.View);
    function MainView() {
      this.close = __bind(this.close, this);
      this.renderNav = __bind(this.renderNav, this);
      this.render = __bind(this.render, this);
      this.updateFullView = __bind(this.updateFullView, this);
      this.updateMain = __bind(this.updateMain, this);
      MainView.__super__.constructor.apply(this, arguments);
    }
    MainView.prototype.initialize = function(options) {
      return this.navView = new modules.navbar.NavView({
        model: this.model
      });
    };
    MainView.prototype.el = $("#all-view");
    MainView.prototype.template = "<div id=\"nav\"></div>\n<div class=\"container\">\n    <div id=\"main\" class=\"row\">\n    </div>\n</div>";
    MainView.prototype.updateMain = function(view) {
      this.close();
      if (this.$('#nav').html() === '') {
        this.renderNav();
      }
      this.navView.setActive();
      return this.$('#main').html(view.el);
    };
    MainView.prototype.updateFullView = function(view) {
      this.$('#nav').html('');
      return this.$('#main').html(view.el);
    };
    MainView.prototype.render = function() {
      this.$el.html(this.template);
      this.renderNav();
      return this;
    };
    MainView.prototype.renderNav = function() {
      console.log('rendering nav');
      return this.$('#nav').html(this.navView.render().el);
    };
    MainView.prototype.close = function() {
      return this.trigger('closeView');
    };
    return MainView;
  })();
  module.splitKeyValuePairs = function(pairs) {
    var param;
    return _.mash((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = pairs.length; _i < _len; _i++) {
        param = pairs[_i];
        _results.push(param.split('='));
      }
      return _results;
    })());
  };
  module.getParamsMap = function(paramString) {
    paramString = paramString || "";
    return module.splitKeyValuePairs(paramString.split(';'));
  };
  module.getLocationHash = function() {
    return document.location.hash;
  };
  module.getLocationParams = function() {
    var parts;
    parts = module.getLocationHash().split(';');
    return [parts[0], module.splitKeyValuePairs(parts.slice(1))];
  };
  module.buildLocationString = function(base, params) {
    var pair;
    params = ((function() {
      var _i, _len, _ref, _results;
      _ref = _.pairs(params);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pair = _ref[_i];
        if (pair[1]) {
          _results.push(pair.join('='));
        }
      }
      return _results;
    })()).join(';');
    return "" + base + ";" + params;
  };
  module.updateLocationParam = function(name, value) {
    var base, params, _ref;
    _ref = module.getLocationParams(), base = _ref[0], params = _ref[1];
    params[name] = value;
    return routes.navigate(module.buildLocationString(base, params));
  };
  window.attachRouter = function() {
    return $(document).ready(function() {
      var model;
      window.routes = new modules.routes.TronRoutes();
      model = modules.models = new modules.models.QuickFindModel();
      window.mainView = new MainView({
        model: model
      }).render();
      model.fetch();
      return Backbone.history.start({
        root: "/web/"
      });
    });
  };
}).call(this);
