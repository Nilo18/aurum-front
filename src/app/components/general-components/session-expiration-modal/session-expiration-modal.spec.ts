import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { EmployeeRole } from '../../../services/employee-service';
import { SessionExpirationModal } from './session-expiration-modal';

describe('SessionExpirationModal', () => {
  let component: SessionExpirationModal;
  let fixture: ComponentFixture<SessionExpirationModal>;
  const navigate = vi.fn();
  const close = vi.fn();

  beforeEach(async () => {
    navigate.mockReset().mockResolvedValue(true);
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [SessionExpirationModal],
      providers: [
        { provide: NgbActiveModal, useValue: { close } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SessionExpirationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('auth_token'));

  it('offers only the redirect action', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1);
    const redirect = vi.spyOn(component, 'redirectUser');
    buttons[0].click();
    expect(redirect).toHaveBeenCalled();
  });

  it('clears the token and redirects staff before closing', async () => {
    localStorage.setItem('auth_token', 'expired-token');
    navigate.mockImplementation(async () => {
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(close).not.toHaveBeenCalled();
      return true;
    });
    await component.redirectUser();
    expect(navigate).toHaveBeenCalledWith(['/staff-login'], { replaceUrl: true });
    expect(close).toHaveBeenCalledOnce();
  });

  it('redirects demo users home', async () => {
    component.role = EmployeeRole.DEMO;
    await component.redirectUser();
    expect(navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it.each([false, new Error('Navigation failed')])(
    'allows retry after failed navigation',
    async (result) => {
      if (result instanceof Error) navigate.mockRejectedValue(result);
      else navigate.mockResolvedValue(result);
      await component.redirectUser();
      fixture.detectChanges();
      expect(close).not.toHaveBeenCalled();
      expect(component.redirecting()).toBe(false);
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    },
  );
});
