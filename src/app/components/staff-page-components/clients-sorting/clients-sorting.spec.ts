import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsSorting } from './clients-sorting';

describe('ClientsSorting', () => {
  let component: ClientsSorting;
  let fixture: ComponentFixture<ClientsSorting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [ClientsSorting],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsSorting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
