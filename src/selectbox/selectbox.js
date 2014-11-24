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
    .service('SelectBox', [function() {
        return {
            counter: 0,
            init: function() {
                this.counter += 1;
            }
        };
    }])
    .controller('SelectBoxCtrl', ['$scope', '$document', '$element', 'SelectBox', function($scope, $document, $element, SelectBox) {

        SelectBox.init();

        $scope.view = {};
        $scope.view.show = false;
        $scope.view.tabindex = SelectBox.counter;
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

            unbindEvents();
        };

        /**
         * Handle keyboard key press
         * - if enter or space do the selection of the focused item form the list
         * - if down or up key arrow focus the appropriate item from the list
         *
         * @param e
         * @returns {boolean}
         */
        var keyHandler = function(e) {

            // enter | space
            if ([13, 32].indexOf(e.keyCode) !== -1 && $scope.view.focus) {

                $scope.selectItem($scope.view.focus);

                if (!$scope.multi) {
                    $scope.view.show = false;
                }

                $scope.$apply();

                return false;
            }

            if ([38, 40].indexOf(e.keyCode) === -1) { return false; }

            var min = 0;
            var max = $scope.list.length - 1;

            $scope.view.focus = (typeof $scope.view.focus === 'undefined') ? -1 : $scope.view.focus;

            // key arrow down
            if (e.keyCode === 40) {
                if ($scope.view.focus === max) {
                    $scope.view.focus = min;
                } else {
                    $scope.view.focus += 1;
                }
            }
            // key arrow up
            if (e.keyCode === 38) {
                if ($scope.view.focus <= min) {
                    $scope.view.focus = max;
                } else {
                    $scope.view.focus -= 1;
                }
            }

            $scope.$apply();

            var $container = $element[0].querySelector('.mad-selectbox-dropdown');
            var $focus = $container.querySelector('.focus');
            var containerHeight = $container.offsetHeight;
            var currentOffset = $focus.offsetHeight * ($scope.view.focus + 1);

            if (currentOffset >= containerHeight) {
                $container.scrollTop = currentOffset;
            } else if (currentOffset <= $container.scrollTop) {
                $container.scrollTop = 0;
            }


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
                $element.on('keydown', keyHandler);
            } else {
                unbindEvents();
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

        var unbindEvents = function() {

            $scope.view.focus = -1;
            $document.unbind('click', clickHandler);
            $element.off('keydown', keyHandler);

        };

        $scope.$on('$destroy', function() {
            unbindEvents();
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
            template: '<div tabindex="{{ view.tabindex }}" class="mad-selectbox" ng-class="{\'mad-selectbox-multi\': multi}">'+
                        '<a href ' +
                            'id="{{ view.instanceId }}"'+
                            'class="mad-selectbox-toggle"'+
                            'ng-click="toggleList()"'+
                            'ng-class="{active: view.show}">'+
                            '{{ multi ? (title || \'Select\') : (view.selected.name || view.selected || \'Select\') }}'+
                        '</a>'+
                        '<ul class="mad-selectbox-dropdown" ng-show="view.show">'+
                            '<li ng-repeat="item in list track by $index"'+
                                'ng-class="{active: multi ? (view.selected | contains:item.id) : ($index === index), focus: ($index === view.focus)}">'+
                                '<a href class="mad-selectbox-item" ng-click="selectItem($index)">{{ item.name || item }}</a>'+
                            '</li>'+
                            '<li class="mad-empty" ng-if="list.length === 0">the list is empty</li>'+
                        '</ul>'+
                      '</div>'
        };
    }]);
