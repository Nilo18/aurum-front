import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardGetResponse, DashboardService } from '../../../services/dashboard-service';
import { human } from '../shared/staff-format';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly data = signal<DashboardGetResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly human = human;
  readonly links = [
    { path: 'clients', count: 'clientCount' },
    { path: 'employees', count: 'employeeCount' },
    { path: 'vehicles', count: 'vehicleCount' },
    { path: 'products', count: 'productCount' },
    { path: 'suppliers', count: 'supplierCount' },
    { path: 'menu', count: 'menuCount' },
    { path: 'feedback', count: 'feedbackCount' },
  ] as const;

  ngOnInit(): void {
    void this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    try {
      this.data.set(await this.dashboardService.getDashboardData());
    } catch {
      this.error.set('We couldn’t load the dashboard. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
