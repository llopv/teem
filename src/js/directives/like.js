'use strict';

angular.module('Teem')
  .directive('like', function() {
    return {
      controller: [
      '$scope', '$element', '$attrs', 'SessionSvc', '$timeout',
      function($scope, $element, $attrs, SessionSvc, $timeout) {
        $scope.likeIcon = $attrs.likeIcon;
        $scope.likeCopyOn  = $attrs.likeCopyOn;
        $scope.likeCopyOff = $attrs.likeCopyOff;

        $element.on('click', function() {
          SessionSvc.loginRequired(function() {
            $scope.project.toggleSupport();
            $timeout();
          });

        });
      }],
      templateUrl: 'like.html'
    };
  });
