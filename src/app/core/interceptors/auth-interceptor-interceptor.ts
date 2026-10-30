import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../services/token-service';
import { throwError } from 'rxjs';
import { BackendUrlHolderService } from '../../services/backend-url-holder-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const backendUrlHolder = inject(BackendUrlHolderService);
  const tokenService = inject(TokenService);

  const baseUrl = new URL(
    backendUrlHolder.getBaseUrl(),
    document.baseURI
  );
  const requestUrl = new URL(req.url, document.baseURI);
  const basePath = baseUrl.pathname.replace(/\/+$/, '');

  const isBackend =
    requestUrl.origin === baseUrl.origin &&
    (requestUrl.pathname === basePath ||
      requestUrl.pathname.startsWith(`${basePath}/`));

  if (!isBackend) {
    return next(req);
  }

  const publicPaths = ['/', '/api/auth'];

  const isPublic = publicPaths.some(path =>
    requestUrl.pathname === path ||
    (path !== '/' && requestUrl.pathname.startsWith(`${path}/`))
  );

  if (isPublic) {
    return next(req);
  }

  const token = tokenService.getToken();

  if (!token) {
    console.log('Token is invalid: ', token)
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};