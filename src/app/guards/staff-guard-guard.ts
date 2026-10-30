import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { TokenService } from '../services/token-service';

export const staffGuardGuard: CanActivateChildFn = (childRoute, state) => {
  const tokenService = inject(TokenService)
  const router = inject(Router)

  return tokenService.getToken() ? true : router.createUrlTree(['/'])
};
