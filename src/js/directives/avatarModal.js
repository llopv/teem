'use strict';

angular.module('Teem')
  .directive('avatarModal', ['$timeout', function() {
    return {
      controller: ['$scope', 'SessionSvc', '$timeout', '$q', function($scope, SessionSvc, $timeout, $q) {
        $scope.rawAvatar = '';
        $scope.croppedAvatar = '';
        $scope.cropping = false;
        $scope.avatar = '';
        $scope.image = null;
        $scope.imageFileName = '';

        function handleFileSelect(evt) {
          console.log('hola caracola');
          $scope.cropping = true;
          var file = evt.currentTarget.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            $scope.$apply(function($scope) {
              $scope.rawAvatar = evt.target.result;
            });
          };
          reader.readAsDataURL(file);
        }

        $scope.rawAvatar = function(file) {
          var deferred = $q.defer();
          var reader = new FileReader();
          reader.onload = function (evt) {
            $scope.$apply(function($scope) {
              //console.log(evt.target.result)
              deferred.resolve(evt.target.result);
            });
          };
          reader.readAsDataURL(file);
          return deferred.promise;
        };



        SessionSvc.getUserProfile(function(res) {
          if (res.data.avatar_url) {
            $scope.$apply(function() {
              $scope.avatar = 'http://localhost:9898' + res.data.avatar_url;
            });
          }
        });

        $scope.saveAvatar = function() {
          $scope.cropping = false;
          SessionSvc.updateUserProfile({avatar_data: $scope.croppedAvatar}, function (res) {
            if (res.error) {
              return;
            }
            $scope.$apply(function() {
              $scope.avatar = 'http://localhost:9898' + res.data.avatar_url;
            });
          });
        };

        $scope.deleteAvatar = function() {
          SessionSvc.updateUserProfile({avatar_data: false}, function(res) {
            if(res.error) {
              return;
            }
            $scope.rawAvatar = '';
            $scope.croppedAvatar = '';
            $scope.avatar = '';
          });
        };
        angular.element(document.querySelector('#avatar')).on('change', handleFileSelect);
      }],
      templateUrl: 'avatar-modal.html'
    };
  }]);
