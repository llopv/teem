'use strict';

/**
 * @ngdoc function
 * @name Pear2Pear.controller:ChatCtrl
 * @description
 * # Chat Ctrl
 * Show Pad for a given project
 */

angular.module('Pear2Pear')
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/communities/:comId/projects/:id/pad', {
        templateUrl: 'pad/show.html',
        controller: 'PadCtrl'
      });
  }])
  .controller('PadCtrl', [
  'SessionSvc', 'url', '$rootScope', '$scope', '$route', '$location',
  '$timeout', 'SharedState', 'ProjectsSvc', 'ProfilesSvc', 'Loading',
  function(SessionSvc, url, $rootScope, $scope, $route, $location,
  $timeout, SharedState, ProjectsSvc, ProfilesSvc, Loading) {

    $scope.urlId = url.urlId;
    $scope.communityId = $route.current.params.comId;
    var projId = url.decodeUrlId($route.current.params.id);

    var timestampPadAccess = function(){
      ProfilesSvc.current().then(function(prof){
        prof.timestampPadAccess(projId);
      });
    };

    SessionSvc.onLoad(function(){
      Loading.create(ProjectsSvc.find($route.current.params.id)).
        then(function(proxy) {
          $scope.project = proxy;
        });

      timestampPadAccess();
    });

    $scope.$on('$routeChangeStart', function(){
      timestampPadAccess();
    });

    // Should use activeLinks, but https://github.com/mcasimir/mobile-angular-ui/issues/262
    $scope.nav = function(id) {
      return id === 'pad' ? 'selected' : '';
    };

    $scope.titleReminder = function titleReminder() {
      SharedState.turnOff('projectTitleReminder');

      document.querySelector('.project-title input').focus();
    };

    $scope.cancelProject = function() {
      SharedState.turnOff('projectTitleReminder');
      $scope.project.type = 'deleted';
      $scope.project.communities = [];
      $location.path('frontpage');
    };

    $scope.ed = {
      editting: false
    };

    $scope.editOn = function() {
      $scope.ed.editting = true;

      SessionSvc.saving = true;
    };

    $scope.editOff = function() {
      $scope.ed.editting = false;

      SessionSvc.saving = false;
    };

    angular.element(document.querySelector('.wave-editor-on')).
      on('focus', function() {
        console.log('bla');
        $scope.editOn();
      }).
      on('blur', function() {
        $scope.editOff();
      });

    // Do not leave pad without giving a title to the project
    $rootScope.$on('$routeChangeStart', function(event) {
      if ($scope.project.type !== 'deleted' && ($scope.project.title === undefined || $scope.project.title === '')) {
        event.preventDefault();

        SharedState.turnOn('projectTitleReminder');
      }
    });
  }]);
