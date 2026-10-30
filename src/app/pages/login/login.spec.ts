import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Login } from './login';
describe('Login', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-login-hero')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-login-form')).not.toBeNull();
  });
});
