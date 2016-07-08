require.config({
    shim: {
         'bootstrap': ['jquery'],
         'backbone': {
            deps: ['jquery','underscore'],
        },
          'tooltip': ['jquery', 'bootstrap'],
     },
    paths: {
        // major libs
        'text': '../bower_components/text/text',
        'jquery': ['../bower_components/jquery/dist/jquery.min'],
        'underscore': ['../bower_components/underscore/underscore-min'],
        'bootstrap': ['../bower_components/bootstrap/dist/js/bootstrap.min'],
        'backbone': ['../bower_components/backbone/backbone-min'],
        'marionette': ['../bower_components/backbone.marionette/lib/backbone.marionette.min'],
        'd3': ['../bower_components/d3/d3.min'],
        // other libs
        'tooltip': 'libs/tooltip',
        'visualSize': 'libs/visualSize',
        // templates path
        'templates': '../templates',
        //controls
        'Router': 'controls/router',
        'Controller': 'controls/controller',
        //models
        'datacenter': 'models/datacenter.model',
        'config': 'models/config.model',
        //collections
        //views
        'Base': 'views/base.view',
        'AppView': 'views/app.view',
    }
});

require(['app'], function (App) {
    'use strict';
    var app = new App();
    app.start();
});