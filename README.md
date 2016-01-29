angular-selectbox
====

This is simple AngularJS custom selecbox which also supports multi select as well.

It's possible to go through the list with up and down key arrows, and to select the item by hitting enter for single select,
or by hitting space for multi select.

[Demo](http://milica.github.io/angular-selectbox/)

You can download it directly from here or using `bower install angular-selectbox --save`

### Installation

  1. Add the `angularSelectbox` module to your dependencies

    ```javascript
    angular.module('myApp', ['angularSelectbox']);
    ```

  2. Use the `selectbox` directive for single select
  
    ```html
    <selectbox options="array" value="value"></selectbox>
    ```

  3. Use the `selectbox-multi` directive for multi select
  
    ```html
    <selectbox-multi options="array" values="value"></selectbox-multi>
    ```

### Parameters

#### options
Type: `Object`

An array you want to be listed in the selectbox.
 
You can use:

  - flat array: `[1, 2, 3, 4, 5]`
  
  - collection:  `[{id: 1, label: 'item 1'}, {id: 2, label: 'item 2'}, {id: 3, label: 'item 3'}]`

#### value
Type: `Integer`

Value that is selected in selectbox.
 
If it's flat array then it must be the value from the list. 
From the first example (flat list), if you want to select number `2`, than you define `2` to be value.

If it's collection the value is actually value of identifier (for example `id`).
From the second example (collection) if you want to chose `item 1` you pick it's identifier value, which is `1`.

#### onChange
Type: `'Function'`

Callback function when value is selected.

#### idKey
Type: `String`

Default: `id`

Name of the identifier key, by default it's `id`

#### labelKey
Type: `String`

Default: `label`

Name of the label key, by default it's `label`

#### title
Type: `String`

Default: `Select`

Used with `selectbox-multi` directive. Defines the title of the select box, next to the number of selected items.

