import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthResponse, AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { DemoLoginLoadingPage } from './demo-login-loading-page';

describe('DemoLoginLoadingPage', () => {
  let fixture: ComponentFixture<DemoLoginLoadingPage>;
  let component: DemoLoginLoadingPage;
  let resolveLogin: (response: AuthResponse) => void;
  let rejectLogin: (error: unknown) => void;
  let loginAsDemo: ReturnType<typeof vi.fn>;
  let saveToken: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    loginAsDemo = vi.fn(
      () =>
        new Promise<AuthResponse>((resolve, reject) => {
          resolveLogin = resolve;
          rejectLogin = reject;
        }),
    );
    saveToken = vi.fn();
    await TestBed.configureTestingModule({
      imports: [DemoLoginLoadingPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { loginAsDemo } },
        { provide: TokenService, useValue: { saveToken } },
      ],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(DemoLoginLoadingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  async function settle() {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows loading and prevents overlapping requests', async () => {
    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Preparing your demo session');
    await component.login();
    expect(loginAsDemo).toHaveBeenCalledTimes(1);
    resolveLogin({ status: 200, token: 'demo-token' });
    await settle();
    expect(saveToken).toHaveBeenCalledWith('demo-token');
    expect(navigate).toHaveBeenCalledWith(['/staff']);
    expect(component.isLoading()).toBe(false);
  });

  it('shows connection errors and supports retry from the button', async () => {
    rejectLogin(new HttpErrorResponse({ status: 0 }));
    await settle();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Check your connection',
    );
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(component.errorMessage()).toBe('');
    expect(component.isLoading()).toBe(true);
    expect(loginAsDemo).toHaveBeenCalledTimes(2);
    resolveLogin({ status: 200, token: 'retry-token' });
    await settle();
    expect(saveToken).toHaveBeenCalledWith('retry-token');
  });

  it.each([
    { status: 500, token: 'invalid' },
    { status: 200, token: '' },
  ])('rejects an unsuccessful or empty-token response: %o', async (response) => {
    resolveLogin(response);
    await settle();
    expect(component.errorMessage()).toContain('could not start');
    expect(component.isLoading()).toBe(false);
    expect(saveToken).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows storage failures without navigating', async () => {
    saveToken.mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    resolveLogin({ status: 200, token: 'demo-token' });
    await settle();
    expect(component.errorMessage()).toContain('Allow site storage');
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([false, new Error('Navigation failed')])(
    'handles navigation failure: %s',
    async (result) => {
      if (result instanceof Error) navigate.mockRejectedValue(result);
      else navigate.mockResolvedValue(result);
      resolveLogin({ status: 200, token: 'demo-token' });
      await settle();
      expect(component.errorMessage()).toContain('could not open');
      expect(component.isLoading()).toBe(false);
    },
  );

  it('ignores a response after leaving the page', async () => {
    fixture.destroy();
    resolveLogin({ status: 200, token: 'demo-token' });
    await Promise.resolve();
    expect(saveToken).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
