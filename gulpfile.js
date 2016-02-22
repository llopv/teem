'use strict';

/*=====================================
=        Default Configuration        =
=====================================*/

// Please use config.js to override these selectively:

var config = {
  dest: 'www',
  minify_images: true,

  vendor: {
    js: [
      './bower_components/modernizr/modernizr.js',
      './bower_components/angular/angular.js',
      './bower_components/angular-route/angular-route.js',
      './bower_components/angular-translate/angular-translate.js',
      './bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      './bower_components/mobile-angular-ui/dist/js/mobile-angular-ui.js',
      './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      './bower_components/angular-ui-select/dist/select.js',
      './bower_components/angular-elastic/elastic.js',
      './bower_components/angular-bindonce/bindonce.js',
      './bower_components/angular-utf8-base64/angular-utf8-base64.js',
      './bower_components/SHA-1/sha1.js',
      './bower_components/angulartics/src/angulartics.js',
      './bower_components/angulartics/src/angulartics-piwik.js',
      './bower_components/angular-swellrt/angular-swellrt.js',
      './bower_components/hammerjs/hammer.js',
      './bower_components/ryanmullins-angular-hammer/angular.hammer.js',
      './bower_components/angular-sanitize/angular-sanitize.js',
      './bower_components/angular-animate/angular-animate.js',
      './bower_components/angular-toArrayFilter/toArrayFilter.js',
      './bower_components/swiper/dist/js/swiper.js',
      './bower_components/avatar/build/avatar.js',
      './bower_components/avatar/vendor/md5.js',
      './bower_components/moment/moment.js',
      './bower_components/moment/locale/es.js',
      './bower_components/angular-moment/angular-moment.js',
      './bower_components/ng-img-crop/compile/unminified/ng-img-crop.js',
      './bower_components/ng-file-upload/ng-file-upload.js'

    ],

    fonts: [
      './bower_components/font-awesome/fonts/fontawesome-webfont.*',
      './src/fonts/*'
    ]
  },

  swellrt: {
    host: 'localhost:9898',
    protocol: 'http://',
    docker: {
      name: 'teem-swellrt'
    }
  },

  angularSwellrt: {
    path: './bower_components/angular-swellrt'
  },

  /*
   * Application Configuration
   *
   * Variables injected to AngularJs config value in src/js/app.js
   *
   * Example:
   * config.app.support = {
   *   communityId: 'local.net/s+EWN1NKmVbsO',
   *   projectId:   'local.net/s+3WKINJhZMp8'
   * };
   */
  app: {
  },

  server: {
    host: '0.0.0.0',
    port: '8000'
  },

  serverTest: {
    host: '127.0.0.1',
    port: '9001'
  },

  weinre: false,

  piwik: false,

  deploy: {
    files: {
      branch: 'dist'
    },
    swellrt: {
      name:  'teem-swellrt',
      image: 'p2pvalue/swellrt',
      args: ' -p 9898:9898 -h swellrt'
    }
  }
};


if (require('fs').existsSync('./config.js')) {
  var configFn = require('./config');
  configFn(config);
}

// Build SwellRT url
if (! config.swellrt.server) {
  config.swellrt.server = config.swellrt.protocol + config.swellrt.host;
  if (config.swellrt.port) {
    config.swellrt.server += ':' + config.swellrt.port;
  }
}

// Setup angular-swellrt stuff, depending on path
config.vendor.js.push(config.angularSwellrt.path + '/angular-swellrt.js');
config.angularSwellrt.swellrt = require(config.angularSwellrt.path + '/swellrt.json');

// Track SwellRT version in SwellRT config
// This way, clients are updated with the new SwellRT version
// despite the code does not change
config.swellrt.version = config.angularSwellrt.swellrt.version;

// Fill docker options
if (config.swellrt.docker && !config.swellrt.docker.tag) {
  config.swellrt.docker.tag = config.angularSwellrt.swellrt.version;
}

if (config.deploy && !config.deploy.swellrt.tag) {
  config.deploy.swellrt.tag = config.angularSwellrt.swellrt.version;
}

// Use configuration in other modules, such as Karma
module.exports.config = config;

/*-----  End of Configuration  ------*/


/*========================================
=            Requiring stuffs            =
========================================*/

var gulp           = require('gulp'),
  seq            = require('run-sequence'),
  connect        = require('gulp-connect'),
  sass           = require('gulp-sass'),
  uglify         = require('gulp-uglify'),
  sourcemaps     = require('gulp-sourcemaps'),
  cssmin         = require('gulp-cssmin'),
  order          = require('gulp-order'),
  concat         = require('gulp-concat'),
  ignore         = require('gulp-ignore'),
  rimraf         = require('gulp-rimraf'),
  imagemin       = require('gulp-imagemin'),
  pngcrush       = require('imagemin-pngcrush'),
  templateCache  = require('gulp-angular-templatecache'),
  mobilizer      = require('gulp-mobilizer'),
  ngAnnotate     = require('gulp-ng-annotate'),
  replace        = require('gulp-replace'),
  ngFilesort     = require('gulp-angular-filesort'),
  streamqueue    = require('streamqueue'),
  rename         = require('gulp-rename'),
  ssh            = require('ssh2').Client,
  path           = require('path'),
  watch          = require('gulp-watch'),
  jshint         = require('gulp-jshint'),
  karma          = require('karma').Server,
  angularProtractor = require('gulp-angular-protractor'),
  ghPages        = require('gulp-gh-pages'),
  dockerSwellrt  = require('gulp-docker-swellrt'),
  manifest       = require('gulp-manifest');


/*================================================
=            Report Errors to Console            =
================================================*/

gulp.on('error', function(e) {
  throw(e);
});


/*=========================================
=            Clean dest folder            =
=========================================*/

gulp.task('clean', function (cb) {
  return gulp.src([
    path.join(config.dest, '*.html'),
    path.join(config.dest, 'images'),
    path.join(config.dest, 'css'),
    path.join(config.dest, 'js'),
    path.join(config.dest, 'fonts'),
    path.join(config.dest, 'l10n')
  ], { read: false })
 .pipe(rimraf());
});


/*==========================================
=            Start a web server            =
==========================================*/

gulp.task('connect', function() {
  if (typeof config.server === 'object') {
    connect.server({
      root: config.dest,
      host: config.server.host,
      port: config.server.port,
      livereload: true
    });
  } else {
    throw new Error('Connect is not configured');
  }
});

/*==============================================================
=            Setup live reloading on source changes            =
==============================================================*/

gulp.task('livereload', function () {
  gulp.src(path.join(config.dest, '*.html'))
    .pipe(connect.reload());
});


/*=====================================
=            Minify images            =
=====================================*/

gulp.task('images', function () {
  var stream = gulp.src('src/images/**/*');

  if (config.minify_images) {
    stream = stream.pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngcrush()]
    }));
  }

  return stream.pipe(gulp.dest(path.join(config.dest, 'images')));
});


/*==================================
=            Copy fonts            =
==================================*/

gulp.task('fonts', function() {
  return gulp.src(config.vendor.fonts)
    .pipe(gulp.dest(path.join(config.dest, 'fonts')));
});

/*==================================
=            Copy l10n            =
==================================*/

gulp.task('l10n', function() {
  return gulp.src('src/l10n/**/*')
    .pipe(gulp.dest(path.join(config.dest, 'l10n')));
});


/*=================================================
=            Copy html files to dest              =
=================================================*/

gulp.task('html', function() {
  var inject = [];

  if (config.swellrt) {
    inject.push('<script src="'+config.swellrt.server+'/swellrt/swellrt.nocache.js"></script>');
    inject.push('<script>var SwellRTConfig = '+JSON.stringify(config.swellrt)+';</script>');
  }

  if (config.piwik) {
    // Note that Angulartics needs that the trackPageView event from the original is removed
    inject.push('<script type="text/javascript"> var _paq = _paq || []; _paq.push([\'enableLinkTracking\', true]); (function() { var u="' + config.piwik.server + '"; _paq.push([\'setTrackerUrl\', u+\'piwik.php\']); _paq.push([\'setSiteId\', ' + config.piwik.siteId + ']); var d=document, g=d.createElement(\'script\'), s=d.getElementsByTagName(\'script\')[0]; g.type=\'text/javascript\'; g.async=true; g.defer=true; g.src=u+\'piwik.js\'; s.parentNode.insertBefore(g,s); })(); </script>');
    inject.push('<noscript><p><img src="' + config.piwik.server + 'piwik.php?idsite=' + config.piwik.siteId + '" style="border:0;" alt="" /></p></noscript>');
  }

  if (typeof config.weinre === 'object') {
    inject.push('<script src="http://'+config.weinre.boundHost+':'+config.weinre.httpPort+'/target/target-script-min.js"></script>');
  }

  gulp.src(['src/html/**/*.html'])
  .pipe(replace('<!-- inject:js -->', inject.join('\n    ')))
  .pipe(gulp.dest(config.dest));
});


/*======================================================================
=            Compile, minify, mobilize Sass                            =
======================================================================*/

gulp.task('sass', function () {
  gulp.src('./src/sass/app.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [ path.resolve(__dirname, 'src/sass'), path.resolve(__dirname, 'bower_components') ]
    }).on('error', sass.logError))
    /* Currently not working with sourcemaps
    .pipe(mobilizer('app.css', {
      'app.css': {
        hover: 'exclude',
        screens: ['0px']
      },
      'hover.css': {
        hover: 'only',
        screens: ['0px']
      }
    }))
    */
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: '/css/'
    }))
    .pipe(gulp.dest(path.join(config.dest, 'css')));
});

/*====================================================================
=                             jshint                                 =
====================================================================*/

gulp.task('jshint', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


/*====================================================================
=            Compile and minify js generating source maps            =
====================================================================*/
// - Orders ng deps automatically
// - Precompile templates to ng templateCache

gulp.task('js:app', function() {
  return streamqueue({ objectMode: true },
    // Vendor: angular, mobile-angular-ui, etc.
    gulp.src(config.vendor.js),
    // app.js is configured
    gulp.src('./src/js/app.js').
    pipe(replace('value(\'config\', {}). // inject:app:config',
                 'value(\'config\', ' + JSON.stringify(config.app) + ').')),
    // rest of app logic
    gulp.src(['./src/js/**/*.js', '!./src/js/app.js', '!./src/js/widgets.js']).
    pipe(ngFilesort()),
    // app templates
    gulp.src(['src/templates/**/*.html']).pipe(templateCache({ module: 'Teem' }))
  )
  .pipe(sourcemaps.init())
  .pipe(concat('app.js'))
  .pipe(ngAnnotate())
//  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(sourcemaps.write('.', {
    sourceMappingURLPrefix: '/js/'
  }))
  .pipe(gulp.dest(path.join(config.dest, 'js')));
});

gulp.task('js:widgets', function() {
  return gulp.src('./src/js/widgets.js')
  //.pipe(uglify())
  .pipe(gulp.dest(path.join(config.dest, 'js')));
});


gulp.task('js', function(callback) {
  var tasks = ['js:app', 'js:widgets'];

  seq(tasks, callback);
});

/*==================================
=            Cordova files         =
==================================*/

gulp.task('cordova', function() {
  return gulp.src('src/vendor/cordova/**/*')
    .pipe(gulp.dest(path.join(config.dest, 'js/cordova')));
});


/*===================================================================
=                Generate HTML5 Cache Manifest files                =
===================================================================*/

gulp.task('manifest', function(){
  gulp.src([ config.dest + '/**/*' ], { base: config.dest })
    .pipe(manifest({
      cache: [
        config.swellrt.server + '/swellrt/swellrt.nocache.js'
      ],
      exclude: 'app.manifest',
      hash: true
    }))
  .pipe(gulp.dest(config.dest));
});

/*===================================================================
=            Watch for source changes and rebuild/reload            =
===================================================================*/

gulp.task('watch', function () {
  if (typeof config.server === 'object') {
    watch([config.dest + '/**/*'], function() { gulp.start('livereload'); });
  }
  watch(['./src/html/**/*'], function() { gulp.start('html'); });
  watch(['./src/sass/**/*'], function() { gulp.start('sass'); });
  watch(config.vendor.js.concat(['./src/js/**/*', './src/templates/**/*', '!./src/js/widgets.js']), function() { gulp.start(['jshint', 'js:app']); });
  watch(config.vendor.js.concat(['./src/js/widgets.js']), function() { gulp.start(['jshint', 'js:widgets']); });
  watch(['./src/images/**/*'], function() { gulp.start('images'); });
  watch(['./src/l10n/**/*'], function() { gulp.start('l10n'); });
});


/*===================================================
=            Starts a Weinre Server                 =
===================================================*/

gulp.task('weinre', function() {
  if (typeof config.weinre === 'object') {
    var weinre = require('./node_modules/weinre/lib/weinre');
    weinre.run(config.weinre);
  } else {
    throw new Error('Weinre is not configured');
  }
});


/*======================================
=            Build Sequence            =
======================================*/

gulp.task('build', function(done) {
  var tasks = ['html', 'fonts', 'l10n', 'images', 'sass', 'js', 'cordova'];
  seq('clean', tasks, done);
});

/*====================================
=      Run SwellRT with Docker       =
====================================*/

gulp.task('docker:swellrt', function(done) {
  dockerSwellrt(config.swellrt.docker, done);
});

/*======================================
=        Unit testing with Karma       =
======================================*/

gulp.task('test:unit', function(done) {
  new karma({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done).start();
});

/*================================================
=        End to end testing with protractor      =
=================================================*/


gulp.task('test:e2e', function(done) {
  connect.server({
    root: config.dest,
    host: config.serverTest.host,
    port: config.serverTest.port
  });

  gulp.src(['./test/e2e/**/*.js'])
    .pipe(angularProtractor({
      'configFile': 'test/protractor.conf.js',
      'autoStartStopServer': true,
      'debug': true
    }))
    .on('error', function(e) { connect.serverClose(); throw e; })
    .on('end', function() { connect.serverClose(); done(); });
});

/*====================================
=              Test Task             =
====================================*/

gulp.task('test', function(done){
  var tasks = [];

  if (config.swellrt.docker) {
    tasks.push('docker:swellrt');
  }

  tasks.push('test:unit', 'test:e2e');
  seq(tasks, done);
});

/*====================================
=              Deploy Task           =
====================================*/

gulp.task('deploy:swellrt', function(done) {
  var taggedImage = config.deploy.swellrt.image + ':' + config.deploy.swellrt.tag,
      connection = new ssh();

  function start() {
    var cmd = 'docker run ' +
      config.deploy.swellrt.args +
      ' --name ' + config.deploy.swellrt.name +
      ' -d ' + taggedImage;

    console.log(cmd);

    connection.exec(cmd, function(err, stream) {

      if (err) { throw err ; }

      stream.
        on('data', function(d) {
          console.log('ssh: ' + d);
        }).
        on('close', function() {
          done();
          connection.end();
        }).
        stderr.on('data', function(data) { console.log('STDERR: ' + data); });
    });
  }

  function stop(id, cb) {
    var cmd = 'docker stop ' + id + ' && docker rm ' + id;

    connection.exec(cmd, function(err, stream) {
      if (err) { throw err ; }

      stream.
        on('data', function(d) {
          console.log('ssh: ' + d);
        }).
        on('close', function() {
          cb();
        }).
        stderr.on('data', function(data) { console.log('STDERR: ' + data); });
    });
  }


  connection.on('ready', function() {
    connection.exec('docker inspect ' + config.deploy.swellrt.name, function(err, stream) {
      if (err) { throw err ; }

      var data = '';

      stream.
        on('data', function(d) {
          data += d;
          console.dir('on data: ' + data);
        }).
        on('close', function() {
          setTimeout(function() {
            console.dir('on close: ' + data);

            var container = JSON.parse(data)[0];

            if (container) {
              if (container.Config.Image === taggedImage) {
                // Right image is deployed
                console.log('swellrt already running');
                done();
                connection.end();
              } else {
                console.log('updating swellrt');
                stop(container.Id, function() {
                  start();
                });
              }
            } else {
              console.log('swellrt not running');
              start();
            }
          }, 5000);
        }).
        stderr.on('data', function(data) { console.log('STDERR: ' + data); });
    });
  }).connect(config.deploy.swellrt.ssh);
});

gulp.task('deploy:files', function() {
  return gulp.src('./www/**/*')
    .pipe(ghPages(config.deploy.files));
});

gulp.task('deploy', function(done) {
  var tasks = ['deploy:swellrt', 'deploy:files'];

  seq(tasks, done);
});

/*============================================
=         Continous Delivery Task            =
============================================*/

gulp.task('cd', function(done) {
  seq('build', 'manifest', 'test', 'deploy', done);
});



/*====================================
=            Default Task            =
====================================*/

gulp.task('default', function(done){
  var tasks = [];

  if (config.swellrt.docker) {
    tasks.push('docker:swellrt');
  }

  if (typeof config.weinre === 'object') {
    tasks.push('weinre');
  }

  if (typeof config.server === 'object') {
    tasks.push('connect');
  }

  tasks.push('watch');

  seq('build', tasks, done);
});
