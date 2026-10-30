import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { RequestEvent } from './pages/request-event/request-event';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Staff } from './pages/staff/staff';
import { DemoLoginLoadingPage } from './pages/demo-login-loading-page/demo-login-loading-page';
import { Feedback } from './pages/feedback/feedback';
import { staffGuardGuard } from './guards/staff-guard-guard';
import { homeGuard } from './guards/home-guard';

export const routes: Routes = [
  {
    path: 'privacy-policy',
    title: 'Privacy Policy | AURUM',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then((module) => module.PrivacyPolicy),
  },
  {
    path: 'terms-and-conditions',
    title: 'Terms and Conditions | AURUM',
    loadComponent: () =>
      import('./pages/terms-and-conditions/terms-and-conditions').then(
        (module) => module.TermsAndConditions,
      ),
  },
  { path: '', component: Home, canActivate: [homeGuard] },
  { path: 'request-event', component: RequestEvent, canActivate: [homeGuard] },
  { path: 'staff-login', component: Login, canActivate: [homeGuard] },
  { path: 'staff-register', component: Register, canActivate: [homeGuard] },
  { path: 'demo', component: DemoLoginLoadingPage, canActivate: [homeGuard] },
  { path: 'feedback', component: Feedback, canActivate: [homeGuard] },
  {
    path: 'staff',
    component: Staff,
    canActivateChild: [staffGuardGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/staff-page-components/dashboard/dashboard').then(
            (module) => module.Dashboard,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./components/staff-page-components/events/events').then(
            (module) => module.Events,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/staff-page-components/clients/clients').then(
            (module) => module.Clients,
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./components/staff-page-components/employees/employees').then(
            (module) => module.Employees,
          ),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./components/staff-page-components/vehicles/vehicles').then(
            (module) => module.Vehicles,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/staff-page-components/products/products').then(
            (module) => module.Products,
          ),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./components/staff-page-components/suppliers/suppliers').then(
            (module) => module.Suppliers,
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./components/staff-page-components/feedback/feedback').then(
            (module) => module.Feedback,
          ),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./components/staff-page-components/menu/menu').then((module) => module.Menu),
      },
    ],
  },
  {
    path: '**',
    title: 'Page not found | AURUM',
    loadComponent: () =>
      import('./components/general-components/not-found/not-found').then(
        (module) => module.NotFound,
      ),
  },
];
