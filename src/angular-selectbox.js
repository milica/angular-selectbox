(function () {
  'use strict';

  angular
    .module('angularSelectbox', [])
    .run(run)
    .directive('selectbox', selectbox)
    .directive('selectboxMulti', selectboxMulti)
    .factory('Selectbox', Selectbox);

  /** @ngInject */
  function run($templateCache) {

    $templateCache.put('selectbox.html',
      '<div ' +
      '  tabindex="{{ vm.instance }}" ' +
      '  class="sb-container" ' +
      '  id="{{ vm.formatInstance(vm.instance) }}">' +
      '  <a href="" ' +
      '     class="sb-toggle" ' +
      '     ng-click="vm.toggle()" ' +
      '     ng-class="{\'sb-toggle-active\': vm.active}">' +
      '    {{ vm.selected[vm.labelKey] || vm.value || vm.title }}' +
      '  </a>' +
      '  <ul class="sb-dropdown" ng-show="vm.active">' +
      '    <li ' +
      '      class="sb-item" ' +
      '      ng-repeat="option in vm.options track by $index" ' +
      '      ng-class="{\'sb-item-active\': option === vm.selected,\'sb-item-focus\': $index === vm.focus}">' +
      '        <a href="" ' +
      '           class="sb-item-handle" ' +
      '           ng-click="vm.change(option)" ' +
      '           title="{{ option[vm.labelKey] || option }}">' +
      '          {{ option[vm.labelKey] || option }}' +
      '        </a>' +
      '    </li>' +
      '    <li class="sb-item sb-empty" ng-if="vm.options.length === 0">the list is empty</li>' +
      '  </ul>' +
      '</div>');

    $templateCache.put('selectbox-multi.html',
      '<div ' +
      '  tabindex="{{ vm.instance }}" ' +
      '  class="sb-container sb-container-multi" ' +
      '  id="{{ vm.formatInstance(vm.instance) }}">' +
      '  <a href="" ' +
      '     class="sb-toggle" ' +
      '     ng-click="vm.toggle()" ' +
      '     ng-class="{\'sb-toggle-active\': vm.active}">' +
      '    {{ vm.title }}{{ vm.values.length ? (\': \' + vm.values.length) : vm.title }}' +
      '  </a>' +
      '  <ul class="sb-dropdown" ng-show="vm.active">' +
      '    <li ' +
      '      class="sb-item" ' +
      '      ng-repeat="option in vm.options track by $index" ' +
      '      ng-class="{\'sb-item-active\': vm.contains(vm.values, option[vm.idKey]),\'sb-item-focus\': $index === vm.focus}">' +
      '        <a href="" ' +
      '           class="sb-item-handle" ' +
      '           ng-click="vm.change(option)" ' +
      '           title="{{ option[vm.labelKey] || option }}">' +
      '          {{ option[vm.labelKey] || option }}' +
      '        </a>' +
      '    </li>' +
      '    <li class="sb-item sb-empty" ng-if="vm.options.length === 0">the list is empty</li>' +
      '  </ul>' +
      '</div>');
  }

  /** @ngInject */
  function selectbox() {

    return {
      restrict: 'E',
      templateUrl: 'selectbox.html',
      scope: {},
      controller: SelectboxController,
      controllerAs: 'vm',
      bindToController: {
        options: '=',
        value: '=',
        idKey: '@',
        labelKey: '@',
        title: '@',
        onChange: '&'
      }
    };

    /** @ngInject */
    function SelectboxController($scope, $element, $document, $timeout, Selectbox) {

      var vm = this;

      var _sbDropdown = $element[0].querySelector('.sb-dropdown');
      var _defaults = Selectbox.getDefaults();

      vm.instance = Selectbox.getInstance();
      vm.active = _defaults.active;
      vm.focus = _defaults.focus;
      vm.idKey = vm.idKey || _defaults.idKey;
      vm.labelKey = vm.labelKey || _defaults.labelKey;
      vm.title = vm.title || _defaults.title;

      _getSelected();

      vm.formatInstance = formatInstance;
      vm.toggle = toggle;
      vm.change = change;

      $scope.$on('$destroy', _unbind);

      /**
       * Get selected object
       *
       * @private
       */
      function _getSelected() {

        if (!vm.options.length) { return; }

        if (vm.options[0][vm.idKey]) {
          for (var i = 0; i < vm.options.length; i += 1) {
            if (vm.options[i][vm.idKey] === vm.value) {
              vm.selected = vm.options[i];
              break;
            }
          }
        } else {
          vm.selected = vm.value;
        }

      }

      /**
       * Format instance identifier to be used in the view as id for example
       *
       * @returns {string} formatted instance identifier
       */
      function formatInstance() {

        return Selectbox.formatInstance(vm.instance);

      }

      /**
       * Toggle drop-down visibility and (un)bind events
       *
       */
      function toggle() {

        vm.active = !vm.active;

        $timeout(function () {
          if (vm.active) {
            _bind();
          } else {
            _unbind();
          }
        });

      }

      /**
       * Change selected value and initiate the callback function if defined
       *
       * @param {*} value value to select
       */
      function change(value) {

        vm.value = value[vm.idKey] || value;

        _getSelected();

        if (angular.isDefined(vm.onChange)) { vm.onChange({value: vm.value}); }

      }

      /**
       * Handle click event on document in order to determine
       * if selectbox should be closed
       *
       * @param {Object} e event object
       * @private
       */
      function _handleClick(e) {

        var targetId = Selectbox.getId(e.target.parentNode);

        if (formatInstance() === targetId) { return; }

        toggle();

      }

      /**
       * Handle keydown event
       * - recognize ENTER in order to select value
       * - recognize UP and DOWN arrow keys to highlight the value
       *
       * @param {Object} e event object
       * @param {number} e.keyCode event key code
       * @private
       */
      function _handleKeyDown(e) {

        var min = 0;
        var max = vm.options.length - 1;

        if (e.keyCode === 13) { // enter

          $timeout(function () {
            vm.change(vm.options[vm.focus]);
          });

          return;
        }

        if (e.keyCode !== 40 && e.keyCode !== 38) { return; }

        $timeout(function () {
          vm.focus = Selectbox.getFocus(vm.focus, min, max, e.keyCode);
          Selectbox.updateScrollPosition(vm.focus, _sbDropdown);
        });

      }

      /**
       * Bind click and keydown events
       *
       * @private
       */
      function _bind() {

        $document.bind('click', _handleClick);
        $element.on('keydown', _handleKeyDown);

      }

      /**
       * Unbind click and keydown events and reset focus
       *
       * @private
       */
      function _unbind() {

        vm.focus = 0;

        $document.unbind('click', _handleClick);
        $element.off('keydown', _handleKeyDown);

      }

    }

  }

  function selectboxMulti() {

    return {
      restrict: 'E',
      templateUrl: 'selectbox-multi.html',
      scope: {},
      controller: SelectboxMultiController,
      controllerAs: 'vm',
      bindToController: {
        title: '@',
        options: '=',
        values: '=',
        idKey: '@',
        labelKey: '@',
        onChange: '&'
      }
    };

    /** @ngInject */
    function SelectboxMultiController($scope, $element, $document, $timeout, Selectbox) {

      var vm = this;

      var _sbDropdown = $element[0].querySelector('.sb-dropdown');
      var _defaults = Selectbox.getDefaults();

      vm.instance = Selectbox.getInstance();
      vm.title = vm.title || 'Select';
      vm.active = _defaults.active;
      vm.focus = _defaults.focus;
      vm.idKey = vm.idKey || _defaults.idKey;
      vm.labelKey = vm.labelKey || _defaults.labelKey;

      vm.formatInstance = formatInstance;
      vm.toggle = toggle;
      vm.change = change;
      vm.contains = contains;

      $scope.$on('$destroy', _unbind);

      /**
       * Format instance identifier to be used in the view as id for example
       *
       * @returns {string} formatted instance identifier
       */
      function formatInstance() {

        return Selectbox.formatInstance(vm.instance);

      }

      /**
       * Toggle drop-down visibility and (un)bind events
       *
       */
      function toggle() {

        vm.active = !vm.active;

        $timeout(function () {
          if (vm.active) {
            _bind();
          } else {
            _unbind();
          }
        });

      }

      /**
       * Change selected values and initiate the callback function if defined
       *
       * @param {*} value value to select
       */
      function change(value) {

        var id = value[vm.idKey];
        var index = vm.values.indexOf(id);

        if (index === -1) {
          vm.values.push(id);
        } else {
          vm.values.splice(index, 1);
        }

        if (angular.isDefined(vm.onChange)) { vm.onChange({values: vm.values}); }

      }

      /**
       * Check if item belongs to an array
       *
       * @param {Array} array array where the item is checked
       * @param {*} item item which is checked
       * @returns {boolean}
       */
      function contains(array, item) {

        return array.indexOf(item) !== -1;

      }

      /**
       * Handle click event on document in order to determine
       * if selectbox should be closed
       *
       * @param {Object} e event object
       * @private
       */
      function _handleClick(e) {

        var targetId = Selectbox.getId(e.target.parentNode);
        var itemClicked = !targetId && e.target.classList.contains('sb-item-handle');

        if (formatInstance() === targetId || itemClicked) { return; }

        toggle();

      }

      /**
       * Handle keydown event
       * - recognize SPACE in order to select values
       * - recognize ENTER in order to close dropdown
       * - recognize UP and DOWN arrow keys to highlight the value
       *
       * @param {Object} e event object
       * @param {number} e.keyCode event key code
       * @private
       */
      function _handleKeyDown(e) {

        var min = 0;
        var max = vm.options.length - 1;

        if ([32, 13].indexOf(e.keyCode) !== -1) { // space or enter

          $timeout(function () {

            if (e.keyCode === 13) { // enter
              _unbind();
            }

            if (e.keyCode === 32) { // space
              vm.change(vm.options[vm.focus]);
            }
          });

          return;
        }

        if (e.keyCode !== 40 && e.keyCode !== 38) { return; }

        $timeout(function () {
          vm.focus = Selectbox.getFocus(vm.focus, min, max, e.keyCode);
          Selectbox.updateScrollPosition(vm.focus, _sbDropdown);
        });

      }

      /**
       * Bind click and keydown events
       *
       * @private
       */
      function _bind() {

        $document.bind('click', _handleClick);
        $element.on('keydown', _handleKeyDown);

      }

      /**
       * Unbind click and keydown events and reset focus
       *
       * @private
       */
      function _unbind() {

        vm.focus = _defaults.focus;
        vm.active = _defaults.active;

        $document.unbind('click', _handleClick);
        $element.off('keydown', _handleKeyDown);

      }

    }

  }
  function Selectbox() {

    var _counter = 0;

    var _defaults = {
      active: false,
      focus: 0,
      idKey: 'id',
      labelKey: 'label',
      title: 'Select'
    };

    return {
      getInstance: getInstance,
      getDefaults: getDefaults,
      formatInstance: formatInstance,
      getFocus: getFocus,
      updateScrollPosition: updateScrollPosition,
      getId: getId
    };

    /**
     * Get next instance identifier
     *
     * @returns {number}
     */
    function getInstance() {

      _counter += 1;

      return _counter;

    }

    /**
     * Get default options
     *
     * @returns {*}
     */
    function getDefaults() {

      return angular.copy(_defaults);

    }

    /**
     * Format instance in order to use it in template
     *
     * @param {number} instance instance identifier
     * @returns {string}
     */
    function formatInstance(instance) {

      return 'sb-' + instance;

    }

    /**
     * Update focus of the element
     *
     * @param {number} focus current focus
     * @param {number} min minimal focus
     * @param {number} max maximum focus
     * @param {number} keyCode keycode which tell if going up or down
     * @returns {*}
     */
    function getFocus(focus, min, max, keyCode) {

      if (keyCode === 40) { // key arrow down
        focus = (focus >= max) ? min : (focus + 1);
      }

      if (keyCode === 38) { // key arrow up
        focus = (focus <= min) ? max : (focus - 1);
      }

      return focus;

    }

    /**
     * Update scroll position of the container
     *
     * @param {number} focus currently focused element
     * @param {object} dropdown scrollable dropdown
     */
    function updateScrollPosition(focus, dropdown) {

      var activeItem = dropdown.querySelector('.sb-item-focus');
      var currentOffset = activeItem.offsetHeight * focus;

      if (currentOffset >= dropdown.offsetHeight) {
        dropdown.scrollTop = currentOffset;
      } else if (currentOffset <= dropdown.scrollTop) {
        dropdown.scrollTop = 0;
      }

    }

    /**
     * Get an id of the node
     *
     * @param {Object} node DOM element
     * @returns {*}
     */
    function getId(node) {

      if (typeof node.getAttribute !== 'function') {
        return null;
      }

      return node.getAttribute('id');

    }

  }


})();
