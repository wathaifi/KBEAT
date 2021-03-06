requirejs.config({
  baseUrl: '/kbeat/assets',
  paths: {
    'angular': 'vendor/angular/angular',
    'angular-cookies': 'vendor/angular-cookies/angular-cookies.min',
    'angular-i18n': 'vendor/angular-i18n/angular-locale_es-ar',
    'jquery': 'vendor/jquery/dist/jquery.min',
    'bootstrap': 'vendor/bootstrap/dist/js/bootstrap.min',
    'angular-translate': 'vendor/angular-translate/angular-translate.min',
    'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'angular-translate-storage-cookie': 'vendor/angular-translate-storage-cookie/angular-translate-storage-cookie.min',
    'angular-translate-storage-local': 'vendor/angular-translate-storage-local/angular-translate-storage-local.min',
    'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
    'angular-underscore': 'vendor/angular-underscore/angular-underscore.min',
    'angular-animate' :'vendor/angular-animate/angular-animate',
    'angular-aria' :'vendor/angular-aria/angular-aria',
    'angular-messages':'vendor/angular-messages/angular-messages',
    'angular-material' :'vendor/angular-material/angular-material.min',
    'md-steppers':'vendor/md-steppers/dist/md-steppers.min',
    'angular-material-data-table':'vendor/angular-material-data-table/dist/md-data-table.min',
    'md-data-table':'vendor/md-data-table/dist/md-data-table-templates',
    'underscore': 'vendor/underscore/underscore-min',
    'angular-scroll':'vendor/angular-scroll/angular-scroll',
    'fabricjs':'vendor/fabric.js/dist/fabric.min',
    'angular-moment': 'vendor/angular-moment/angular-moment.min',
    'moment': 'vendor/moment/min/moment-with-locales.min',
    'moment-timezone': 'vendor/moment-timezone/builds/moment-timezone-with-data.min',
    'd3': 'vendor/d3/d3.min',
    'nvd3-base': 'vendor/nvd3/build/nv.d3.min',
    'nvd3': 'vendor/angular-nvd3/dist/angular-nvd3.min',
    'angular-loading-bar': 'vendor/angular-loading-bar/build/loading-bar.min',
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-i18n': {
      deps: ['angular']
    },
    'angular-cookies': {
      deps: ['angular']
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'angular-underscore': {
      deps: ['angular', 'underscore']
    },
    'angular-translate': {
      deps: ['angular']
    },
    'angular-translate-loader': {
      deps: ['angular-translate']
    },
    'angular-translate-storage-cookie': {
      deps: ['angular-translate']
    },
    'angular-translate-storage-local': {
      deps: ['angular-translate']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-aria': {
      deps: ['angular']
    },
    'angular-messages': {
      deps: ['angular']
    },
    'angular-material': {
      deps: ['angular']
    },
    'md-steppers': {
      deps: ['angular']
    },
    'angular-material-data-table': {
      deps: ['angular']
    },
     'angular-scroll': {
      deps: ['angular']
    },
    'jquery':{
      exports: 'jquery'
    },
    'bootstrap':{
      deps:['jquery']
    },
    'angular-moment': {
      deps: ['angular', 'moment-timezone']
    },
    'moment-timezone': {
      deps: ['moment']
    },
    'd3': {
      exports: 'd3'
    },
    'nvd3-base' : {
      deps: ['angular', 'd3']
    },
    'nvd3':{
      deps: ['nvd3-base']
    },
    'angular-loading-bar': {
      deps: ['angular']
    }
  }
});

// Bootstrapping
require(['app/main']);
