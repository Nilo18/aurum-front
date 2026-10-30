import { TestBed } from '@angular/core/testing';
import { BackendUrlHolderService } from './backend-url-holder-service';
describe('BackendUrlHolderService', () => {
  it('provides a stable absolute API origin', () => {
    const service = TestBed.inject(BackendUrlHolderService);
    expect(service.getBaseUrl()).toBe('http://localhost:8080');
    expect(new URL(service.getBaseUrl()).origin).toBe(service.getBaseUrl());
    expect(TestBed.inject(BackendUrlHolderService)).toBe(service);
  });
});
