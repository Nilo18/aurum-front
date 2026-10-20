import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemoLoadingHeader } from '../../components/demo-loading-page-components/demo-loading-header/demo-loading-header';
import { DemoLoadingCard } from '../../components/demo-loading-page-components/demo-loading-card/demo-loading-card';
import { DemoLoadingFooter } from '../../components/demo-loading-page-components/demo-loading-footer/demo-loading-footer';
import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { getRequestErrorMessage } from '../../services/request-error';

@Component({
  selector: 'app-demo-login-loading-page',
  imports: [DemoLoadingHeader, DemoLoadingCard, DemoLoadingFooter],
  templateUrl: './demo-login-loading-page.html',
  styleUrl: './demo-login-loading-page.scss',
})
export class DemoLoginLoadingPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly loadingMessage = signal('Preparing your demo session');

  ngOnInit(): void {
    void this.login();
  }

  async login(): Promise<void> {
    if (this.isLoading() || this.destroyRef.destroyed) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.loadingMessage.set('Preparing your demo session');

    try {
      const res = await this.authService.loginAsDemo();

      if (this.destroyRef.destroyed) return;

      if (res?.status !== 200 || !res.token) {
        this.errorMessage.set('We could not start your demo session. Please try again.');
        return;
      }

      try {
        this.tokenService.saveToken(res.token);
      } catch {
        this.errorMessage.set('Allow site storage to start your demo session, then try again.');
        return;
      }

      this.loadingMessage.set('Opening your workspace');
      try {
        const navigated = await this.router.navigate(['/staff']);
        if (!navigated && !this.destroyRef.destroyed) {
          this.errorMessage.set('We could not open your workspace. Please try again.');
        }
      } catch {
        if (!this.destroyRef.destroyed) {
          this.errorMessage.set('We could not open your workspace. Please try again.');
        }
      }
    } catch (error) {
      if (this.destroyRef.destroyed) return;
      this.errorMessage.set(
        getRequestErrorMessage(error, 'We could not start your demo session. Please try again.'),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
