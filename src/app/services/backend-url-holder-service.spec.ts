import { TestBed } from '@angular/core/testing';

import { BackendUrlHolderService } from './backend-url-holder-service';

describe('BackendUrlHolderService', () => {
  let service: BackendUrlHolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendUrlHolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
