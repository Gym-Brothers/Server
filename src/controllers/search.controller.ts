import { Controller, Get, Query, Sse } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncOperationsService } from '../services/async-operations.service';

@Controller('search')
export class SearchController {
  private searchTerms$ = new Subject<string>();
  private filters$ = new Subject<any>();

  constructor(private asyncOperationsService: AsyncOperationsService) {}

  // Traditional search endpoint
  @Public()
  @Get('coaches')
  async searchCoaches(
    @Query('term') searchTerm: string = '',
    @Query('specialization') specialization?: string,
    @Query('rating') minRating?: string
  ) {
    const filters = {
      specialization,
      minRating: minRating ? parseFloat(minRating) : undefined
    };

    // Get instant results for immediate response
    const results = await this.asyncOperationsService
      .searchCoachesWithFilters(this.searchTerms$, this.filters$)
      .toPromise();

    // Emit search terms for reactive processing
    this.searchTerms$.next(searchTerm);
    this.filters$.next(filters);

    return {
      message: 'Coach search completed',
      data: results || [],
      searchTerm,
      filters
    };
  }

  // NEW: Real-time search results streaming
  @Public()
  @Sse('coaches/stream')
  getSearchResultsStream(): Observable<any> {
    return this.asyncOperationsService
      .searchCoachesWithFilters(this.searchTerms$, this.filters$)
      .pipe(
        map(results => ({
          data: JSON.stringify({
            type: 'search_results',
            payload: {
              coaches: results,
              count: results.length,
              timestamp: new Date().toISOString()
            }
          })
        }))
      );
  }

  // Trigger search from frontend
  @Public()
  @Get('trigger')
  triggerSearch(
    @Query('term') searchTerm: string,
    @Query('specialization') specialization?: string,
    @Query('rating') minRating?: string
  ) {
    const filters = {
      specialization,
      minRating: minRating ? parseFloat(minRating) : undefined
    };

    this.searchTerms$.next(searchTerm);
    this.filters$.next(filters);

    return { message: 'Search triggered', searchTerm, filters };
  }
}
