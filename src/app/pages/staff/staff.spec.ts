import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Staff } from './staff';
describe('Staff', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Staff],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  it('renders its content and child sections', async () => {
    const fixture = TestBed.createComponent(Staff);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-sidebar')).not.toBeNull();
  });
});
