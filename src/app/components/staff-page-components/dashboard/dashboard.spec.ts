import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { DashboardGetResponse, DashboardService } from '../../../services/dashboard-service';
import { Dashboard } from './dashboard';

const response: DashboardGetResponse = {
  eventCount: 1234,
  awaitingReviewCount: 7,
  portfolioValue: 98765,
  employeeCount: 12,
  eventsInPreparation: [
    { eventType: 'BIRTHDAY', date: '2026-10-08', guestCount: 90, clientName: 'Backend Client' },
  ],
  clientCount: 21,
  vehicleCount: 4,
  productCount: 35,
  supplierCount: 6,
  menuCount: 8,
  feedbackCount: 9,
};

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let resolveRequest: (data: DashboardGetResponse) => void;
  let rejectRequest: (error: unknown) => void;
  let getDashboardData: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getDashboardData = vi.fn().mockImplementation(
      () =>
        new Promise<DashboardGetResponse>((resolve, reject) => {
          resolveRequest = resolve;
          rejectRequest = reject;
        }),
    );
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: DashboardService, useValue: { getDashboardData } }],
    }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  it('shows loading skeletons and prevents duplicate requests', async () => {
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Loading');
    expect(fixture.nativeElement.querySelector('.dashboard__stats .skeleton')).not.toBeNull();
    await fixture.componentInstance.loadDashboard();
    expect(getDashboardData).toHaveBeenCalledTimes(1);
    resolveRequest(response);
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders backend metrics, event details, and section counts', async () => {
    resolveRequest(response);
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(element.querySelector('.skeleton')).toBeNull();
    expect(
      Array.from(element.querySelectorAll('.dashboard__stats strong'), (node) =>
        node.textContent?.trim(),
      ),
    ).toEqual(['1,234', '7', '₾ 98,765', '12']);
    expect(element.querySelector('.dashboard__event-row')?.textContent).toContain('Backend Client');
    expect(element.querySelector('.dashboard__date-tile strong')?.textContent).toBe('08');
    expect(
      Array.from(element.querySelectorAll('.dashboard__quick-links strong'), (node) =>
        node.textContent?.trim(),
      ),
    ).toEqual(['21 ↗', '12 ↗', '4 ↗', '35 ↗', '6 ↗', '8 ↗', '9 ↗']);
    expect(element.textContent).not.toContain('Sample data');
  });

  it('shows a backend failure and lets the user retry successfully', async () => {
    rejectRequest(new Error('Backend unavailable'));
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'couldn’t load',
    );
    expect(fixture.nativeElement.querySelector('.dashboard__stats')).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(getDashboardData).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    resolveRequest({ ...response, eventsInPreparation: [] });
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No events are currently in preparation.');
    expect(fixture.nativeElement.querySelector('.dashboard__stats')).not.toBeNull();
  });
});
