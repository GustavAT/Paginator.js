Paginator.js
============

**Paginator.js is still in progress**

Simple implementation of a paginator. The paginator includes the following features:
 - Scrolling through pages and jumping to the first/last page using the buttons in the navigation bar.
 - Sorting the content by clicking on the header of a column if it isn't disabled by the user.
 - Sorting the content using a specified type, i.e. string, number, date etc.
 - Showing/hiding the header, navigation bar or specified columns
 - Hiding navigation bar if only a few items, filling table with empty lines etc.

![Paginator](https://ninjadevs.files.wordpress.com/2014/10/paginator.png)

[>> JSFiddle](http://jsfiddle.net/jy3ffyag/)

###Usage

1. Create a new empty div-block with an id:
```html
<div id="paginator" style="width: 200px"></div>
```
2. Define Columns:
```javascript
var header = ["#", "Product", "Price"];
```
3. Specify your content:
```javascript
var entries = [];
entries.push([1, "Fish", 2.49]);
entries.push([2, "Apple", 0.99]);
// add some more products
```
4. Define some options:
```javascript
var options = {};
options.types = ["number", "string", "number"];
options.maxRows = 4;
options.defaultColumn = 1;
// have a look at documentation for all options
```
5. Create a new Paginator instance and look at the result:
```javascript
var paginator = new Paginator("paginator", entries, header, options);
```

![Paginator](https://ninjadevs.files.wordpress.com/2014/10/paginator.png)


**Full documentation and examples comming soon**
