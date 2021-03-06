(function (angular) {
  
  'use strict';
  
  angular.module('birdyard.nodes')
  
  .config(['$routeProvider', function ($routeProvider) {
    
    // Current User's profile
    $routeProvider.whenAuthenticated('/user/', {
      controller: 'userController',
      templateUrl: 'modules/user/views/user.html',
      resolve: {
        user: ['$Auth', function ($Auth) {
          var $auth = $Auth;
          return $auth.$waitForAuth();
        }]
      }
    });
    
    // Any User's public profile info
    $routeProvider.whenAuthenticated('/user/:userid', {
      controller: 'userController',
      templateUrl: 'modules/user/views/user.html',
      resolve: {
        user: ['$Auth', function ($Auth) {
          var $auth = $Auth;
          return $auth.$waitForAuth();
        }]
      }
    });
        
  }]);
  
})(angular);