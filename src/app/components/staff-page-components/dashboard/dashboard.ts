import { StringFormatterService } from '../../../services/string-formatter-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard-service';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly stringFormatter = inject(StringFormatterService);
  private readonly dashboardService = inject(DashboardService);
  readonly dashboard = rxResource({ stream: () => this.dashboardService.getDashboardData() });
  readonly data = computed(() => (this.dashboard.hasValue() ? this.dashboard.value() : null));
  readonly loading = computed(() => this.dashboard.isLoading());
  readonly error = computed(() =>
    this.dashboard.error() ? 'We couldn’t load the dashboard. Please try again.' : '',
  );
  readonly links = [
    { path: 'clients', count: 'clientCount' },
    { path: 'employees', count: 'employeeCount' },
    { path: 'vehicles', count: 'vehicleCount' },
    { path: 'products', count: 'productCount' },
    { path: 'suppliers', count: 'supplierCount' },
    { path: 'menu', count: 'menuCount' },
    { path: 'feedback', count: 'feedbackCount' },
  ] as const;

  loadDashboard(): void {
    if (!this.loading()) this.dashboard.reload();
  }
}
