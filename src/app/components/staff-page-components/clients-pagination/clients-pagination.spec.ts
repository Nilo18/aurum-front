import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsPagination } from './clients-pagination';

describe('ClientsPagination', () => {
  let component: ClientsPagination;
  let fixture: ComponentFixture<ClientsPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [ClientsPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
