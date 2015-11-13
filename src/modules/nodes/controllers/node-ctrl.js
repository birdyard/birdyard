(function (angular, Move) {
  
  'use strict';
  
  angular.module('bebop.nodes')
  
  .controller('nodeController', ['$scope', '$routeParams', '$location', '$timeout', '$anchorScroll', '$window', 'nodeService', 'breadcrumbService', 'stashService', 'uiService', '$mdDialog', 'CHAR_LIMIT',
  
  function ($scope, $routeParams, $location, $timeout, $anchorScroll, $window, nodeService, breadcrumbService, stashService, uiService, $mdDialog, CHAR_LIMIT) {
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // GLobals & Constants ////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    var SPEED = 200;
    var LAST_SELECTED_NODE = 'last_selected';
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scope properties ///////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    $scope.autoScroll =     true;
    $scope.loaded =         false;
    $scope.showDialog =     false;
    $scope.selected =       {};
    $scope.children =       {};
    $scope.text =           '';
    $scope.charLimit =      CHAR_LIMIT;
    $scope.node =           getNode($routeParams.id);
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function init() {
      
      uiService.setBackgroundValue(uiService.VALUE.DARK);
      
      // If the user switches autoscroll to true, scroll to the bottom
      $scope.$watch('autoScroll', function (newValue, oldValue) {
        if (newValue !== oldValue && newValue) {
          scrollToBottom();
        }
      });

      angular.element($window).bind('scroll', checkBottom);
            
      $timeout(function() {
        scrollToBottom()
      }, SPEED / 2);
    }
    
    function navigateToNode(nodeId) {
      $location.path('n/' + nodeId);
    }
    
    function wait(duration, callback) {
      $timeout(callback, duration);
    }
    
    function focusTextInput() {
      if ($scope.showDialog) {
        $timeout(function () {
          angular.element(document.getElementById('text-input')).focus();
        }, SPEED * 2);
      }
    }
    
    function doTransition(callback) {
      
      var scrollSpeed = SPEED + 'ms';
      
      Move.y('.keep', {top: 240, speed: scrollSpeed, context: Move.CONTEXT.VIEWPORT, easing: 'ease-in'});
      
      wait(SPEED - 10, function () {
        
        Move.y('.keep', {top: 65, speed: scrollSpeed, easing: 'linear'});
        Move.y('.star-wars', {top: -200, speed: scrollSpeed, easing: 'linear'});
        
        wait(SPEED - 10, function () {
          Move.y('.keep', {top: 0, speed: scrollSpeed, easing: 'linear'});
          callback();
        });
      });
    }
    
    function setNodeFromFirebase(id) {
      // Wait until it's loaded, then set
      nodeService.getById(id).$loaded(function (node) {
        $scope.node = node;
      });
    }
    
    function setNodeChildrenFromFirebase(id) {
      nodeService.getChildren(id).$loaded(function (children) {
        
        $scope.children = children;
        $scope.children.$watch(babySitter);
        
        $timeout(function () {
          $scope.loaded = true;
          scrollToBottom();
        }, 0);
      });
    }$scope.showDialog = false;
    
    function getNode(id) {
      
      var lsn = stashService.get(LAST_SELECTED_NODE);

      if (lsn) {
        if (lsn.id === id) {
          setNodeFromFirebase(id);
          return lsn;
        } else {
          return nodeService.getById(id);
        }
      } else {
        return nodeService.getById(id);
      }
    }
    
    function clearDialog() {
      $timeout(function () {
        $scope.text = '';  
      });
    }
    
    function checkBottom() {
      
      $timeout(function() {
        
        var height = $window.innerHeight || document.documentElement.clientHeight; 
        var scroll = document.body.scrollTop || document.documentElement.scrollTop;
        var scrollHeight = getScrollHeight();
        
        // If we're at the bottom & autoScroll is not enabled...
        if ((height + scroll) >= scrollHeight) {
          // enable it
          $scope.autoScroll = true;
        } else {
          // if we're not at the bottom & autoScroll is enabled, disable it.
          $scope.autoScroll = false;
        }
      }, SPEED);
    }
    
    function getScrollHeight() {
      return document.body.scrollHeight || document.documentElement.scrollHeight;    
    }
    
    function scrollToBottom(forceScroll) {
      if ($scope.autoScroll || forceScroll) {
        $timeout(function () {
          $window.scrollTo(0, getScrollHeight());  
        },0);
      }
    }
    
    function babySitter(snap) {
      if (snap.event === 'child_added') {
        scrollToBottom();
      }
    }
    
    function updateCommentCount(operand) {
      var operation = parseInt(operand, 10);
      var updatedCount = angular.copy(($scope.node.commentCount + operation));
      
      // Update node
      $scope.node.commentCount = updatedCount;
      $scope.node.$save();
      
      if ($scope.node.origin) {
        nodeService.getByPath($scope.node.origin).$loaded(function ($snap) {
          $snap.commentCount = updatedCount;
          $snap.$save();
        });
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scope methods //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    setNodeChildrenFromFirebase($routeParams.id);
    
    // Add a comment
    $scope.pushText = function() {
      
      nodeService.format($scope.text).then(function (formatted) {
        
        $timeout(function () {
          $scope.showDialog = false;  
        });
        
        var $new = nodeService.push(formatted);
        
        return $new.$loaded(function () {
        
          // This is a destination id, not the child pushId... may need to rename to make it a bit more obvious
          formatted.id = $new.id;
          
          return $scope.children.$add(formatted).then(function ($snapshot) {
            
            $new.origin = 'nodes/' + $routeParams.id + '/children/' + $snapshot.key();
            $new.breadcrumb = breadcrumbService.push($new.id, angular.copy($scope.node.breadcrumb));
            
            clearDialog();
            
            return $new.$save();
          });
        }).then(function() {
          updateCommentCount('+1');
        });
      }).catch(function(err) {
        console.error(err);
      });
    };
    
    // Navigate to a specific node
    $scope.goToNode = navigateToNode;
    
    // Navigate up one level in the breadcrumb
    $scope.goUp = function () {
      var index = $scope.node.breadcrumb.length - 2;
      var nodeId = $scope.node.breadcrumb[index];
      navigateToNode(nodeId);
    };
    
    // Fade all child nodes... except one.
    $scope.selectChild = function (child) {
      
      // Flag as transitioning to the next node
      $scope.loaded = false;
      
      // Duplicated child node
      var selected = angular.copy(child);
      $scope.selected = selected;
      stashService.set(LAST_SELECTED_NODE, selected);
      
      // Keep the clicked one
      var theChosenOne = angular.element(document.getElementById(child.id));
      theChosenOne.addClass('keep');
      
      // Move stuff
      doTransition(function () {
        // Navigate
        navigateToNode(child.id);
      });
      
      // Fade the rest
      var children = angular.element(document.querySelectorAll('div.child:not(.keep)'));
      children.addClass('ghost'); 
    };
    
    $scope.toggleDialog = function (force) {
      if (typeof force === 'boolean') {
        $scope.showDialog = force;
      } else {
        $scope.showDialog = !$scope.showDialog;
      }
      focusTextInput();
    };
    
    $scope.expandNode = function () {
      $timeout(function () {
        $scope.charLimit = null;  
      });
    };
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Initialization /////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    init();
    
  }]);
  
})(angular, Move);