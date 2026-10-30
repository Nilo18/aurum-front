import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { App } from './app';
@Component({ template: '<h1>Test destination</h1>' })
class TestDestination {}
describe('App', () => {
  it('renders the active route through its router outlet', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'test', component: TestDestination }])],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/test');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Test destination');
  });
});
