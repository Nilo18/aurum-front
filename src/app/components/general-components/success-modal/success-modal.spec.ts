import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SuccessModal } from './success-modal';
describe('SuccessModal', () => {
  it('renders configurable confirmation text and closes on Done', () => {
    const close = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: NgbActiveModal, useValue: { close } }],
    });
    const fixture = TestBed.createComponent(SuccessModal);
    fixture.componentInstance.title = 'Saved';
    fixture.componentInstance.msg = 'Your event was saved.';
    fixture.componentInstance.buttonLabel = 'Continue';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Saved');
    expect(fixture.nativeElement.textContent).toContain('Your event was saved.');
    const button = fixture.nativeElement.querySelector('.success-modal__button');
    expect(button.textContent).toContain('Continue');
    button.click();
    expect(close).toHaveBeenCalledOnce();
  });
});
