import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token-service';
import { inject } from '@angular/core';

export const homeGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService)
  const router = inject(Router)

  return tokenService.getToken() ? router.createUrlTree(['/staff']) : true
};
