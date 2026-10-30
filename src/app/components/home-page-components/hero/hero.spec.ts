import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Hero } from './hero';
describe('Hero', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Hero], providers: [provideRouter([])] });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Hero);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('PREMIUM EVENT MANAGEMENT');
  });
});
