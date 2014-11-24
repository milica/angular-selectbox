Selectbox for AngularJS
====

This is AngularJS directive for the custom selectbox.
It accepts flat list such as `[1, 2, 3, 4, 5]`, but you can also provide array of object which has to be formatted as follows: `[{id: 1, name: 'item 1'}, {id: 2, name: 'item 2'}, {id: 3, name: 'item 3'}]`
It's possible to go through the list with up and down key arrows, and to select the item by hitting enter or space.

[Demo](http://milica.github.io/angular-selectbox/)

### Options

#### list
Type: `Object`

It accepts the array you want to be listed in the selectbox

#### index
Type: `Integer`

It accepts the index of the item you want to be selected in the selectbox

### multi
Type: `String`

Default: `false`

Values: `true` | `false`

If you want your list to be multi-select

### title
Type: `String`

Default: `Select`

If you want custom title for the selectbox. In case of multi select it'll be visible all the time, in case of single select only if no item is selected

### min
Type: `Integer`

Minimum number of items that has to be selected in case of multi-select

### handler
Type: `'Function'`

If you want to trigger certain action in the parent controller when item is selected







