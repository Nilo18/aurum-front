import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { TokenService } from '../services/token-service';
import { staffGuardGuard } from './staff-guard-guard';
describe('staffGuardGuard', () => {
  const getToken = vi.fn();
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TokenService, useValue: { getToken } }],
    }),
  );
  it('handles an authenticated session', () => {
    getToken.mockReturnValue('session');
    const result = TestBed.runInInjectionContext(() =>
      staffGuardGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });
  it('handles a missing session', () => {
    getToken.mockReturnValue(null);
    const result = TestBed.runInInjectionContext(() =>
      staffGuardGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
