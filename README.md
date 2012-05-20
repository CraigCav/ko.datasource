ko.datasource
=============

Datasource Components for KnockoutJs for paging, sorting and filtering remote sources.

##Getting started

1. Include knockout and ko.datasource on your page.

    ```html
    <script src="https://raw.github.com/SteveSanderson/knockout/master/build/output/knockout-latest.debug.js"></script>
    <script src="https://raw.github.com/CraigCav/ko.datasource/master/ko.datasource.js"></script>
    ```

2. Specify your markup as if you were binding to a standard observable or observableArray.

    ```html
	<table>
	    <thead>
	        <tr>
	            <th>Id</th>
	            <th>Name</th>
	            <th>Sales</th>
	            <th>Price</th>
	        </tr>
	    </thead>
	    <tbody data-bind="foreach: items">
	        <tr>
	            <td data-bind="text: id"></td>
	            <td data-bind="text: name"></td>
	            <td data-bind="text: sales"></td>
	            <td data-bind="text: price"></td>
	        </tr>
	    </tbody>            
	</table>
    ```
2b. Optionally specify a pager if desired.

    ```html
	<span id="pager">
	    <button data-bind="click: items.pager.first">First</button>
	    <button data-bind="click: items.pager.previous">Prev</button>
	    <span class="summary">Page 
	        <span data-bind="text: items.pager.page"></span> of 
	        <span data-bind="text: items.pager.totalPages"></span></span>
	    <button data-bind="click: items.pager.next">Next</button>
	    <button data-bind="click: items.pager.last">Last</button>
	</span>
    ```

3. Extend an observable or observableArray with the datasource. The single parameter is a function that provides your data. 
*Optionally* include the pager extender to add paging support.

    ```JavaScript
	var viewModel = {
	    items: ko.observableArray([]).extend({
	        datasource: getAnimals, //getAnimals is a data service to populate the viewmodel
	        pager: {
	            limit: 3
	        }
	    })
	};
    ```
4. Apply Bindings

    ```JavaScript
	ko.applyBindings(viewModel);​
    ```

5. Enjoy!

##Live Sample

Sample usage: http://jsfiddle.net/craigcav/UzUBm/

##Kudos

None of this would've been possible without the inspiring work [Ryan Niemeyer](https://twitter.com/#!/RPNiemeyer) put into documenting KnockoutJS. In particular without the following two posts, this plugin wouldn't exist.

http://www.knockmeout.net/2011/04/pausing-notifications-in-knockoutjs.html
http://www.knockmeout.net/2011/06/lazy-loading-observable-in-knockoutjs.html

##License

MIT license - [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)