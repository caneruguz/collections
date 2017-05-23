/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true
    },
    // Add options here
    sassOptions: {
        includePaths: [
            'node_modules/ember-osf/addon/styles',
            'bower_components/bootstrap-sass/assets/stylesheets',
            'bower_components/osf-style/sass',
            'bower_components/hint.css'
        ]
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

    app.import('bower_components/bootstrap/dist/css/bootstrap.css');
    app.import('bower_components/bootstrap/dist/js/bootstrap.js');

    app.import('bower_components/osf-style/css/base.css');
    app.import('bower_components/loaders.css/loaders.min.css');
    app.import('bower_components/hint.css/hint.min.css');
    app.import('bower_components/jquery.tagsinput/src/jquery.tagsinput.js');

    app.import('vendor/assets/ember-osf.css');


  return app.toTree();
};
