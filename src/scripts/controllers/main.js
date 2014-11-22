'use strict';

angular.module('selectboxAppApp')
    .controller('MainCtrl', function ($scope) {

        $scope.view = {};

        /* flat array */
        $scope.view.list1 = [10, 134, 43, 10093];
        //$scope.view.selected1 = 0;

        /* array of objects */
        $scope.view.list2 = [
            {id: 1, name: 'Apple'},
            {id: 2, name: 'Pear'},
            {id: 3, name: 'Peach'},
            {id: 4, name: 'Banana'},
            {id: 5, name: 'Watermelon'},
            {id: 6, name: 'Walnut'}
        ];
        $scope.view.selected2 = 1;

        /* array of objects */
        $scope.view.list3 = [
            {id: 1, name: 'Mercury'},
            {id: 2, name: 'Venus'},
            {id: 3, name: 'Earth'},
            {id: 4, name: 'Mars'},
            {id: 5, name: 'Jupiter'},
            {id: 6, name: 'Saturn'},
            {id: 7, name: 'Uranus'},
            {id: 8, name: 'Neptune'}
        ];
        $scope.view.selected3 = [0, 2];

    });
