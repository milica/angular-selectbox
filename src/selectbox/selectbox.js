/**
 * Author: Milica Kadic
 * Date: 11/21/14
 * Time: 6:32 PM
 */
'use strict';

angular.module('selectbox', [])
    .filter('contains', [function() {
        return function(array, element) {

            return array.indexOf(element) !== -1;

        };
    }])
    .controller('SelectBoxCtrl', ['$scope', '$document', function($scope, $document) {

        $scope.view = {};
        $scope.view.show = false;
        $scope.view.instanceId = 'inst-' + Date.now();

        /**
         * Check if clicked outside the currently active select box
         *
         * @param e
         * @returns {boolean}
         */
        var clickHandler = function(e) {

            var $element = angular.element(e.target);
            var targetId = $element.attr('id');
            var isMulti = $scope.multi && typeof targetId === 'undefined' && $element.hasClass('mad-selectbox-item');

            if ($scope.view.instanceId === targetId || isMulti) {
                return false;
            }

            $scope.view.show = false;

            $scope.$apply();
        };

        /**
         * Parse provided index in order to form selected object
         */
        var parseSelected = function() {

            if (typeof $scope.list !== 'undefined') {
                if ($scope.multi) {
                    $scope.view.selected = $scope.index;
                } else {
                    $scope.view.selected = $scope.list[$scope.index];
                }
            }

        };

        /**
         * Toggle drop-down list visibility
         *
         */
        $scope.toggleList = function() {

            $scope.view.show = !$scope.view.show;

            if ($scope.view.show) {
                $document.bind('click', clickHandler);
            } else {
                $document.unbind('click', clickHandler);
            }
        };

        /**
         * Select an item and run parent handler if provided
         *
         * @param index
         */
        $scope.selectItem = function(index) {

            if ($scope.multi) {

                var selectedId = $scope.list[index].id;
                var selectedIndex = $scope.view.selected.indexOf(selectedId);

                if (selectedIndex !== -1) {

                    if ($scope.view.selected.length <= parseInt($scope.min, 10)) { return false; }

                    $scope.view.selected.splice(selectedIndex, 1);

                } else {
                    $scope.view.selected.push(selectedId);
                }

                $scope.index = $scope.view.selected;

            } else {
                $scope.view.selected = $scope.list[index];
                $scope.index = index;
            }

            $scope.handler();

        };

        /* init parse selected */
        parseSelected();

        /* watch if list is asynchronously loaded */
        $scope.$watch('list.length', function(n, o) {
            if (n !== o) {
                parseSelected();
            }
        });

        /* watch if selected index has been changed */
        $scope.$watch('index', function(n, o) {
            if (n !== o) {
                parseSelected();
            }
        });

        $scope.$on('$destroy', function() {
            $document.unbind('click', clickHandler);
        });

    }])
    .directive('selectbox', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                list: '=',
                index: '=ngModel',
                multi: '@',
                title: '@',
                min: '@',
                handler: '&'
            },
            controller: 'SelectBoxCtrl',
            template: '<div class="mad-selectbox" ng-class="{\'mad-selectbox-multi\': multi}">'+
                        '<a href ' +
                            'id="{{ view.instanceId }}"'+
                            'class="mad-selectbox-toggle"'+
                            'ng-click="toggleList()"'+
                            'ng-class="{active: view.show}">'+
                            '{{ multi ? (title || \'Select\') : (view.selected.name || view.selected || \'Select\') }}'+
                        '</a>'+
                        '<ul class="mad-selectbox-dropdown" ng-show="view.show">'+
                            '<li ng-repeat="item in list track by $index"'+
                                'ng-class="{active: multi ? (view.selected | contains:item.id) : ($index === index)}">'+
                                '<a href class="mad-selectbox-item" ng-click="selectItem($index)">{{ item.name || item }}</a>'+
                            '</li>'+
                        '</ul>'+
                      '</div>'
        };
    }]);
