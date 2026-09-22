import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { getRequestErrorMessage } from '../../services/request-error';

@Component({
  selector: 'app-demo-login-loading-page',
  imports: [RouterLink],
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
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.loadingMessage.set('Preparing your demo session');

    try {
      const res = await this.authService.loginAsDemo();

      if (res?.status !== 200 || !res.token) {
        this.errorMessage.set('We could not start your demo session. Please try again.');
        return;
      }

      this.tokenService.saveToken(res.token); 

      this.loadingMessage.set('Opening your workspace');
      this.router.navigate(['/staff']);
    } catch (error) {
      this.errorMessage.set(getRequestErrorMessage(error, 'We could not start your demo session. Please try again.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}