(function (ko) {
    function datasource( source, target ){
        var target = target || ko.observable(),
            paused = true;
            trigger = ko.observable( false ),
            result = ko.computed({
                read: function () {
                    if (paused) {
                        paused = false;
                        trigger(true);
                    }
                    return target();
                },
                write: function(newValue) {
                    target( newValue );
                },
                deferEvaluation: true  
            });

        ko.computed(function() {
            if(!trigger()) return;
            source.call( result );
        });
        return result;
    }

    function Pager( limit ) {
        this.page = ko.observable( 1 );
        this.totalCount = ko.observable( 0 );
        this.limit = ko.observable( limit );

        this.totalPages = ko.computed(function () {
            return Math.ceil(ko.utils.unwrapObservable(this.totalCount) / ko.utils.unwrapObservable(this.limit));
        }, this);

        this.next = function () {
            var currentPage = this.page();
            this.page( currentPage + 1 );
        }.bind(this);

        this.previous = function () {
            var currentPage = this.page();
            this.page( currentPage === 0 ? 0 : currentPage - 1 );
        }.bind(this);

        this.first = function () {
            this.page( 1 );
        }.bind(this);

        this.last = function () {
            this.page( this.totalPages() );
        }.bind(this);
    }

    ko.extenders.datasource = function ( target, source ) {
        var result = datasource( source, target );
        result.options = target.options || {};
        return result;
    };

    ko.extenders.pager = function (datasource, options) {
        var pager = new Pager( options.limit || 10 );
        datasource.options = datasource.options || {};
        datasource.options.pager = datasource.pager = pager;
        return datasource;
    };
})(ko);