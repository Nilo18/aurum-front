import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginHero } from './login-hero';
describe('LoginHero', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LoginHero], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(LoginHero);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('The people behind the experience');
  });
});
