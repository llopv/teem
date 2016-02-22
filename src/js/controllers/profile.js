'use strict';

/**
 * @ngdoc function
 * @name Teem.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the Teem
 */

angular.module('Teem')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/profile', {
        templateUrl: 'profile/index.html',
        controller: 'ProfileCtrl'
      });
  }])
  .controller('ProfileCtrl', ['$scope', 'SessionSvc', '$timeout', function ($scope, SessionSvc, $timeout) {
    SessionSvc.loginRequired(function() {
      $scope.user = SessionSvc.users.current();
    });
  }]);
