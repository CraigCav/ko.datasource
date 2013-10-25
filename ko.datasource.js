/*! https://github.com/CraigCav/ko.datasource */
(function (ko) {
    function datasource(source, target) {
        var _target = target || ko.observable(),
            paused = true,
            trigger = ko.observable(false),
            loading = ko.observable(false),
            result = ko.computed({
                read: function () {
                    if (paused) {
                        paused = false;
                        trigger(true);
                    }
                    return _target();
                },
                write: function (newValue) {
                    _target(newValue);
                    loading(false);
                },
                deferEvaluation: true
            }),
            async = false,
            callback = function (state, value) {
                var source = state.source, isAsync = state.isAsync, sync = state.sync;
                if (!isAsync) {
                    result(value);
                } else {
                    if (source.sync == sync) {
                        result(value);
                    }
                }
            },
            curry = function (fn) {
                var slice = [].slice,
                    args = slice.call(arguments, 1);
                return function () {
                    return fn.apply(this, args.concat(slice.call(arguments)));
                };
            },
            isFunction = function(obj) {
                return !!(obj && obj.constructor && obj.call && obj.apply);
            },
            //parseJSON borrowed from jQuery
            parseJSON = function (data) {
                if (!data) return null;
                var rvalidchars = /^[\],:{}\s]*$/,
	            rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	            rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	            rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
                // Attempt to parse using the native JSON parser first
                if ( window.JSON && window.JSON.parse ) {
                    return window.JSON.parse( data );
                }
                if ( typeof data === "string" ) {
                    // Make sure leading/trailing whitespace is removed (IE can't handle it)
                    data = jQuery.trim( data );
                    if ( data ) {
                        // Make sure the incoming data is actual JSON
                        // Logic borrowed from http://json.org/json2.js
                        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                            .replace( rvalidtokens, "]" )
                            .replace( rvalidbraces, "")) ) {

                            return ( new Function( "return " + data ) )();
                        }
                    }
                }

                jQuery.error( "Invalid JSON: " + data );
            },
            //tinyxhr by Shimon Doodkin - https://gist.github.com/4706967
            tinyxhr = function (url, callback, method, contentType, timeout, params) {
                var requestTimeout,xhr;
                try{ xhr = new XMLHttpRequest(); }catch(e){
                    try{ xhr = new ActiveXObject("Msxml2.XMLHTTP"); }catch (e){
                        if(console)console.log("tinyxhr: XMLHttpRequest not supported");
                        return null;
                    }
                }
                var requestTimeout = setTimeout(function() {xhr.abort(); cb(new Error("tinyxhr: aborted by a timeout"), "",xhr); }, timeout || 10000);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    clearTimeout(requestTimeout);
                    if (!xhr.aborted) {
                        callback(parseJSON(xhr.responseText), xhr.status != 200 ? new Error("tinyxhr: server response status is " + xhr.status) : false, xhr);
                    }
                };
                xhr.open(method?method.toUpperCase():"GET", url, true); 
                if (!params) {
                    xhr.send();
                }
                else {
                    xhr.setRequestHeader('Content-type', contentType ? contentType : 'application/x-www-form-urlencoded');
                    xhr.send(params)
                }
                return xhr;
            },
            query = function(settings, async, callback){
                var body = ko.computed(function () {
                    var serialized = JSON.stringify(settings.params, function (key, value) {
                        if (!ko.isObservable(value)) return value;
                        return ko.utils.unwrapObservable(value);
                    });
                    return JSON.parse(serialized);
                })();
                if (query.xhr && async) {
                    query.xhr.aborted = true;
                    query.xhr.abort();
                    query.xhr = null;
                }
                query.xhr = tinyxhr(settings.url, callback, settings.method || 'POST', settings.contentType, settings.timeout, body);
            };
        if (source.generator) {
            async = source.async;
            if (isFunction(source.generator)) {
                source = source.generator;
            } else {
                source = curry(query, source.generator, async);
            }           
        }
        var generator = function () {
            source.sync = (source.sync || 0) + 1 ;
            var callbackInstance = curry(callback, { sync: source.sync, isAsync: async, source: source });
            source.call(result, callbackInstance);
        };
        ko.computed(function () {
            if (!trigger()) return;
            loading(true);
            generator.call(result);
        });

        result.refresh = function () {
            trigger(trigger() + 1);
        };

        result.loading = loading;

        return result;
    }

    function Pager(limit) {
        this.page = ko.observable(1);
        this.totalCount = ko.observable(0);
        this.limit = ko.observable(limit);

        this.totalPages = ko.computed(function () {
            var count = Math.ceil(ko.utils.unwrapObservable(this.totalCount) / ko.utils.unwrapObservable(this.limit))
            return count == 0 ? 1 : count;
        }, this);

        this.pages = ko.computed(function () {
            var a = [];
            var count = this.totalPages();
            for (var p = 0; p < count; p++) {
                a.push(p + 1);
            }
            return a;
        }, this);

        this.next = function () {
            var currentPage = this.page();
            this.page(currentPage + 1);
        }.bind(this);

        this.previous = function () {
            var currentPage = this.page();
            this.page(currentPage === 0 ? 0 : currentPage - 1);
        }.bind(this);

        this.specific = function (page) {
            this.page(page);
        }.bind(this);

        this.first = function () {
            this.page(1);
        }.bind(this);

        this.last = function () {
            this.page(this.totalPages());
        }.bind(this);

        this.isFirstPage = ko.computed(function () {
            return this.page() == 1;
        }, this);

        this.isLastPage = ko.computed(function () {
            return this.page() == this.totalPages();
        }, this);

        this.isNextPageAvailable = ko.computed(function () {
            return !(this.isLastPage());
        }, this);

        this.isPrevPageAvailable = ko.computed(function () {
            return !(this.isFirstPage());
        }, this);
    }

    ko.extenders.datasource = function (target, source) {
        var result = datasource(source, target);
        result.options = target.options || {};
        return result;
    };

    ko.extenders.pager = function (target, options) {
        var pager = new Pager(options.limit || 10);
        target.options = target.options || {};
        target.options.pager = target.pager = pager;
        return target;
    };
})(ko);
