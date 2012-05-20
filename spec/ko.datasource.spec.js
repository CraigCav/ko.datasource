describe('DataSource', function() {
   var ko = global.ko = require('knockout');
   require('../ko.datasource.js');

   var requestCount = 0,
      sampleData = [{ item: 1 }],
      lastRequest,
      datasource = ko.observableArray([]).extend({ 
         datasource: function( request, response ){
            requestCount++;
            lastRequest = this;
            this(sampleData);
            var page = this.pager.page(); //dependency on page
            this.pager.totalCount( 10 );
         },
         pager: { limit: 3 }
      });

   it('should trigger a request when reading from the observable', function() {
      expect( requestCount ).toEqual( 0 );
      datasource();
      expect( requestCount ).toEqual( 1 );
   });

   it('should contain the results of the response', function() {
      expect( datasource() ).toEqual( sampleData );
   });

   describe('Pagination', function() {       
      it('should limit results', function() {
         expect( lastRequest.pager.limit() ).toEqual( 3 );
      });

      it('should know total row count', function() {
            expect( datasource.pager.totalCount() ).toEqual( 10 );
      });

      it('should trigger datasource to re-evaluate on pagination', function() {
         expect( requestCount ).toEqual( 1 );
         datasource.pager.page( 2 );
         expect( requestCount ).toEqual( 2 );
      });

      it('should know total page count', function(){
         expect( datasource.pager.totalPages() ).toEqual( 4 );
      });

      it('should be paginated (first previous next last)', function() {
         var pager = datasource.pager; 
            pager.page(1);
            expect( pager.page() ).toEqual( 1 );
            pager.next();
            expect( pager.page() ).toEqual( 2 );
            pager.previous();
            expect( pager.page() ).toEqual( 1 );
            pager.last();
            expect( pager.page() ).toEqual( 4 );
            pager.first();
            expect( pager.page() ).toEqual( 1 );
            pager.page(3);
            expect( pager.page() ).toEqual( 3 );
      });
   });
});
