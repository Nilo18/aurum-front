import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { RequestEvent } from './pages/request-event/request-event';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Staff } from './pages/staff/staff';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'request-event', component: RequestEvent },
  { path: 'staff-login', component: Login },
  { path: 'staff-register', component: Register },
  {
    path: 'staff',
    component: Staff,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/staff-page-components/dashboard/dashboard').then(
            (module) => module.Dashboard,
          ),
      },
      {
        path: 'event-requests',
        loadComponent: () =>
          import('./components/staff-page-components/event-requests/event-requests').then(
            (module) => module.EventRequests,
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
];
