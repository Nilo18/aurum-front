import { TestBed } from '@angular/core/testing';

import { QueryFormatterService } from './query-formatter-service';

describe('QueryFormatterService', () => {
  let service: QueryFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
