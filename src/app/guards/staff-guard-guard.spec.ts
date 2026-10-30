import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { staffGuardGuard } from './staff-guard-guard';

describe('staffGuardGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => staffGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
