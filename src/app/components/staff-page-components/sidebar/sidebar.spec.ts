import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { Sidebar } from './sidebar';
describe('Sidebar', () => {
  it('renders every staff destination and signs out through the auth service', () => {
    const logout = vi.fn();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { logout } }],
    });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    for (const section of fixture.componentInstance.sections) {
      expect(
        fixture.nativeElement.querySelector('button[aria-label="' + section.heading + '"]'),
      ).not.toBeNull();
    }
    fixture.nativeElement.querySelector('[aria-label="Sign out"]').click();
    expect(logout).toHaveBeenCalledOnce();
    fixture.componentInstance.collapse.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Sign out"]').title).toBe('Sign out');
  });
});
