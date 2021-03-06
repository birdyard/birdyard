(function (angular) {
  
  'use strict';
  
  angular.module('birdyard.utilities')
  
  .factory('colorService', function () {
    
    // Public
    
    var _colorService = {};
    
    var _colorList = [
      '#ef3e36', // 'Red'
      '#f8ca00', // 'Yellow'
      '#4892e7', // 'Blue'
      '#42c76a', // 'Green'
      '#9b59b6', // 'Purple' 
      '#e67e22' // 'Orange' 
    ];
    
    function _getRandom() {
      var random = Math.floor(Math.random() * (_colorList.length - 1) - 0) + 0;
      return _colorList[random];
    }
    
    _colorService.list = _colorList;
    _colorService.random = _getRandom;
    
    return _colorService;
    
  });
  
})(angular);