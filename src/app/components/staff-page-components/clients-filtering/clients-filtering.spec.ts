import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsFiltering } from './clients-filtering';

describe('ClientsFiltering', () => {
  let component: ClientsFiltering;
  let fixture: ComponentFixture<ClientsFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [ClientsFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
