import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

interface SidebarSection {
  id: number;
  heading: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  public authService = inject(AuthService);
  public router = inject(Router);
  collapse: WritableSignal<boolean> = signal(false);

  sections: SidebarSection[] = [
    {
      id: 1,
      heading: 'Dashboard',
      icon: 'icons/sidebar/dashboard.svg',
      link: '/staff',
    },
    // {
    //   id: 2,
    //   heading: 'Event Requests',
    //   icon: 'icons/sidebar/event-requests.svg',
    //   link: '/staff/event-requests'
    // },
    {
      id: 3,
      heading: 'Events',
      icon: 'icons/sidebar/events.svg',
      link: '/staff/events',
    },
    {
      id: 4,
      heading: 'Clients',
      icon: 'icons/sidebar/clients.svg',
      link: '/staff/clients',
    },
    {
      id: 5,
      heading: 'Employees',
      icon: 'icons/sidebar/employees.svg',
      link: '/staff/employees',
    },
    {
      id: 6,
      heading: 'Vehicles',
      icon: 'icons/sidebar/vehicles.svg',
      link: '/staff/vehicles',
    },
    {
      id: 7,
      heading: 'Products',
      icon: 'icons/sidebar/products.svg',
      link: '/staff/products',
    },
    {
      id: 8,
      heading: 'Suppliers',
      icon: 'icons/sidebar/suppliers.svg',
      link: '/staff/suppliers',
    },
    {
      id: 9,
      heading: 'Feedback',
      icon: 'icons/sidebar/feedback.svg',
      link: '/staff/feedback',
    },
    {
      id: 10,
      heading: 'Menu',
      icon: 'icons/sidebar/menu.svg',
      link: '/staff/menu',
    },
  ];
}
