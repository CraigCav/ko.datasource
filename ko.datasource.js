/*! https://github.com/CraigCav/ko.datasource */
(function ( ko ) {
    function datasource( source, target ) {
        var _target = target || ko.observable(),
            paused = true,
            trigger = ko.observable( false ),
            result = ko.computed( {
                read: function () {
                    if ( paused ) {
                        paused = false;
                        trigger( true );
                    }
                    return _target();
                },
                write: function ( newValue ) {
                    _target( newValue );
                },
                deferEvaluation: true
            } );

        ko.computed( function () {
            if ( !trigger() ) return;
            source.call( result );
        } );

        result.refresh = function () {
            trigger( trigger() + 1 );
        };

        return result;
    }

    function Pager( limit ) {
        this.page = ko.observable( 1 );
        this.totalCount = ko.observable( 0 );
        this.limit = ko.observable( limit );

        this.totalPages = ko.computed( function () {
            var count = Math.ceil( ko.utils.unwrapObservable( this.totalCount ) / ko.utils.unwrapObservable( this.limit ) )
            return count == 0 ? 1 : count;
        }, this );

        this.next = function () {
            var currentPage = this.page();
            this.page( currentPage + 1 );
        } .bind( this );

        this.previous = function () {
            var currentPage = this.page();
            this.page( currentPage === 0 ? 0 : currentPage - 1 );
        } .bind( this );

        this.first = function () {
            this.page( 1 );
        } .bind( this );

        this.last = function () {
            this.page( this.totalPages() );
        } .bind( this );
    }

    ko.extenders.datasource = function ( target, source ) {
        var result = datasource( source, target );
        result.options = target.options || {};
        return result;
    };

    ko.extenders.pager = function ( target, options ) {
        var pager = new Pager( options.limit || 10 );
        target.options = target.options || {};
        target.options.pager = target.pager = pager;
        return target;
    };
} )( ko );