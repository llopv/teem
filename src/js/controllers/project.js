'use strict';

/**
 * @ngdoc function
 * @name Teem.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the Teem
 */

angular.module('Teem')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/projects/:id', {
        templateUrl: 'project.html',
        controller: 'ProjectCtrl',
        // Change between tabs without re-rendering the view
        reloadOnSearch: false
      })
      .when('/communities/:communityId/projects/fetch/:id', {
        controller: 'FetchProject'
      })
      .when('/communities/:communityId/projects/:id', {
        redirectTo: function(params) {
          return '/projects/' + params.id;
        }
      })
      .when('/communities/:communityId/projects/:id/:tab', {
        redirectTo: function(params) {
          return '/projects/' + params.id + '?tab=' + params.tab;
        }
      });
  }])
  .controller('FetchProject', [
  'ProjectsSvc', 'url', '$route', '$location',
  function(ProjectsSvc, url, $route, $location) {
    var communityId = url.decodeUrlId($route.current.params.communityId),
        localId     = $route.current.params.id;

    ProjectsSvc.all({
      community: communityId,
      localId: localId
    }).then(function(projects) {
      var project = projects[0];

      if (project) {
        $location.path('/projects/' + url.urlId(project.id));
        return;
      }

      ProjectsSvc.create({
        communityId:  communityId
      }).then(function(project) {
        project.localId = localId;

        $location.path('/projects/' + url.urlId(project.id));
      });
    });
  }])
  .controller('ProjectCtrl', [
  'SessionSvc', 'url', '$scope', '$rootScope', '$location', '$route',
  'SharedState', 'ProjectsSvc', 'Loading',
  function (SessionSvc, url, $scope, $rootScope, $location, $route,
  SharedState, ProjectsSvc, Loading) {

    $scope.urlId = url.urlId;

    function currentTab() {
      return $location.search().tab || 'pad';
    }

    SessionSvc.onLoad(function(){
      Loading.create(ProjectsSvc.findByUrlId($route.current.params.id)).
        then(function(proxy) {
          $scope.project = proxy;
          $scope.project.setTimestampAccess(currentTab());
        });
    });

    $scope.titleReminder = function titleReminder() {
      SharedState.turnOff('projectTitleReminder');

      document.querySelector('.project-title input').focus();
    };

    SharedState.initialize($scope, 'projectTab',
      { defaultValue: currentTab() });

    $scope.$on('mobile-angular-ui.state.changed.projectTab', function(e, newVal, oldVal) {
      $scope.project.setTimestampAccess(oldVal);
      $scope.project.setTimestampAccess(newVal);

      $location.search({ tab: newVal});
    });

    $scope.$on('$routeChangeStart', function(event, next, current) {
      if (current.params.tab !== undefined) {
        $scope.project.setTimestampAccess(current.params.tab);
      }
    });

    $scope.linkCurrentProject = function() {
      return $location.absUrl();
    };

    $scope.cancelProject = function() {
      SharedState.turnOff('projectTitleReminder');
      $scope.project.type = 'deleted';
      $scope.project.communities = [];
      $location.path('frontpage');
    };

    $scope.hasChanged = function(section){

      if(!$scope.project || ! $scope.project.lastChange(section)){
        return false;
      }

      var lastChange = $scope.project.lastChange(section);
      var lastAccess;
          if ($scope.project.getTimestampAccess()[section]) {
            lastAccess = new Date(($scope.project.getTimestampAccess()[section]).last);
          } else {
            lastAccess = new Date(0);
          }
      return lastChange > lastAccess;
    };

    // Do not leave pad without giving a title to the project
    $rootScope.$on('$routeChangeStart', function(event) {
      if ($scope.project.type !== 'deleted' && ($scope.project.title === undefined || $scope.project.title === '')) {
        event.preventDefault();

        SharedState.turnOn('projectTitleReminder');
      }
    });
  }]);
