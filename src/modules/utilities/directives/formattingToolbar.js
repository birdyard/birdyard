(function (angular) {
  
  'use strict';
  
  angular.module('birdyard.utilities')
  
  .directive('formattingToolbar', ['$timeout', 'selectText', 'stashService', 'markdownFilterService',
    
    function ($timeout, selectText, stashService, markdownFilterService) {
      
    return {
      restrict: 'E',
      replace: true,
      scope: {
        target: '='
      },
      templateUrl: 'modules/utilities/views/formattingToolbar.html',
      link: function (scope, element, attrs) {
        
        // Private
        
        var RECENT_NODES_PREFIX = '___recentNode_';
        var TEXTAREA_INPUT =      attrs['targetid'];
        
        function insertMarkdown(input) {
          if (scope.target) {
            scope.target = scope.target + '\n\n' + input;  
          } else {
            scope.target = input;
          }
        }
        
        function highlight(startFromEnd, endFromEnd) {
          selectText(
            TEXTAREA_INPUT, 
            scope.target.length - startFromEnd, 
            scope.target.length - endFromEnd
          );
        }
        
        function getRecentNodes() {
          return stashService.get(new RegExp(RECENT_NODES_PREFIX + '+'));
        }
        
        // Watchers 
        
        scope.$watch('headerIconClicked', function (value) {
          if (value) {
            scope.linkIconClicked = false;
          }
        });
        
        scope.$watch('linkIconClicked', function (value) {
          if (value) {
            scope.headerIconClicked = false;
          }
        });
        
        // Scope
        
        scope.headerIconClicked =   false;
        scope.linkIconClicked =     false;
        scope.recentNodes =         [];
        scope.recentNodes =         getRecentNodes();
        
        scope.insertMedia = function () {
          
          var linkText = '![](http://link-to-image-here/)';
          
          insertMarkdown(linkText);
          highlight(27, 1);
          
          scope.headerIconClicked = false;
          scope.linkIconClicked = false;
        };
        
        scope.insertFormatting = function (_type) {
          
          var bold = '**YOUR-BOLD-TEXT**';
          var italics = '*YOUR-ITALICIZED-TEXT*';
          var heading = ' YOUR HEADING';
          var blockquote = '> YOUR BLOCKQUOTE';
          
          if (_type === 'bold') {
            insertMarkdown(bold);
            highlight(16, 2);
          } else if (_type === 'italic') {
            insertMarkdown(italics);
            highlight(21, 1);
          } else if (_type === 'blockquote') { 
            insertMarkdown(blockquote)
            highlight(15, 0);
          } else if (_type === 'header1') {
            insertMarkdown('#' + heading);
            highlight(12, 0);
          } else if (_type === 'header2') {
            insertMarkdown('##' + heading);
            highlight(12, 0);
          } else if (_type === 'header3') {
            insertMarkdown('###' + heading);
            highlight(12, 0);
          } else if (_type === 'header4') {
            insertMarkdown('####' + heading);
            highlight(12, 0);
          } else if (_type === 'header5') {
            insertMarkdown('#####' + heading);
            highlight(12, 0);
          }
          
          scope.headerIconClicked = false;
          scope.linkIconClicked = false;
        };
        
        scope.insertNodeLink = function (node) {
          scope.linkIconClicked = false;
          var stripped = node.text.split('\n').join('');
          var noMd = markdownFilterService.filter(stripped);
          insertMarkdown('> **' + node.name + ' said:**');
          insertMarkdown('> [' + noMd + '](#/n/' + node.id + ')');
        };
      }
    }
  }]);
  
})(angular);