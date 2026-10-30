import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { TokenService } from '../services/token-service';
import { homeGuard } from './home-guard';
describe('homeGuard', () => {
  const getToken = vi.fn();
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TokenService, useValue: { getToken } }],
    }),
  );
  it('handles an authenticated session', () => {
    getToken.mockReturnValue('session');
    const result = TestBed.runInInjectionContext(() =>
      homeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/staff');
  });
  it('handles a missing session', () => {
    getToken.mockReturnValue(null);
    const result = TestBed.runInInjectionContext(() =>
      homeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });
});
