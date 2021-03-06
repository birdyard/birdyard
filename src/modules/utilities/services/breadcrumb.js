(function (angular) {
  
  'use strict';
  
  angular.module('birdyard.utilities')
  
  .factory('breadcrumbService', function () {
    
    // Public
    
    var _breadcrumbService = {};
    
    // Takes an id onto a breadcrumb trail (Array)
    function _push(id, breadcrumb) {
      if (angular.isArray(breadcrumb) && id) {
        breadcrumb.push(id);
        return breadcrumb;
      } else if (id && !breadcrumb) {
        return [id];
      } else {
        if (breadcrumb) {
          throw new Error('Breadcrumb must be an Array.');
        } else {
          throw new Error('You must provide a valid id.');  
        }
      }
    }
    
    _breadcrumbService.push = _push;
    
    return _breadcrumbService;
    
  });
  
})(angular);