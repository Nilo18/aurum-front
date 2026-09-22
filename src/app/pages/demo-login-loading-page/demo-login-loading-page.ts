import { Component, inject, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo-login-loading-page',
  imports: [],
  templateUrl: './demo-login-loading-page.html',
  styleUrl: './demo-login-loading-page.scss',
})
export class DemoLoginLoadingPage {
  private authService = inject(AuthService)
  private tokenService = inject(TokenService)
  private router = inject(Router)
  errorMessage: WritableSignal<string> = signal('')

  async ngOnInit() {
    try {
      const res = await this.authService.loginAsDemo()

    if (res.status === 200) {
      
      try {
        this.tokenService.saveToken(res.token);
        
        this.router.navigate(['/staff']);

      } catch (storageError) {
        console.error('Security/Storage Error: Token could not be safely stored.', storageError);
        
        this.errorMessage.set("Login failed: Your browser settings or full storage are preventing a secure session. Please disable Private Browsing or free up disk space.")
      }
    }
    } catch (error) {
      console.log(error)
    }
  }
}
