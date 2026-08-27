import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { RequestEvent } from './pages/request-event/request-event';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Staff } from './pages/staff/staff';
import { Dashboard } from './components/staff-page-components/dashboard/dashboard';
import { EventRequests } from './components/staff-page-components/event-requests/event-requests';
import { Events } from './components/staff-page-components/events/events';
import { Clients } from './components/staff-page-components/clients/clients';
import { Employees } from './components/staff-page-components/employees/employees';
import { Vehicles } from './components/staff-page-components/vehicles/vehicles';
import { Products } from './components/staff-page-components/products/products';
import { Suppliers } from './components/staff-page-components/suppliers/suppliers';
import { Feedback } from './components/staff-page-components/feedback/feedback';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'request-event', component: RequestEvent },
    { path: 'staff-login', component: Login },
    { path: 'staff-register', component: Register },
    { 
        path: 'staff',
        component: Staff,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'event-requests', component: EventRequests },
            { path: 'events', component: Events },
            { path: 'clients', component: Clients },
            { path: 'employees', component: Employees },
            { path: 'vehicles', component: Vehicles },
            { path: 'products', component: Products },
            { path: 'suppliers', component: Suppliers },
            { path: 'feedback', component: Feedback },
        ]
    },
];
