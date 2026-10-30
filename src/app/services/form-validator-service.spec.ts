import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormValidatorService } from './form-validator-service';
describe('FormValidatorService', () => {
  const service = new FormValidatorService();
  it.each([
    ['2028-02-29', null],
    ['2027-02-29', { invalidDate: true }],
    ['2026-04-31', { invalidDate: true }],
    ['2026-12-01', null],
    ['12/01/2026', { invalidDate: true }],
    ['', null],
  ])('validates date %s', (value, expected) => {
    expect(service.validDateValidator(new FormControl(value))).toEqual(expected);
  });
  it.each([NaN, Infinity, -Infinity, '12'])('rejects invalid numeric value %s', (value) => {
    expect(service.finiteNumberValidator(new FormControl(value))).toEqual({ invalidNumber: true });
  });
  it.each([0, -1, 1.5, '', null])('allows optional or finite value %s', (value) => {
    expect(service.finiteNumberValidator(new FormControl(value))).toBeNull();
  });
  it('rejects whitespace-only text', () => {
    expect(service.nonWhitespaceValidator(new FormControl('   '))).toEqual({ whitespace: true });
    expect(service.nonWhitespaceValidator(new FormControl(''))).toBeNull();
    expect(service.nonWhitespaceValidator(new FormControl(' Nino '))).toBeNull();
  });
  it('validates local and international phone numbers', () => {
    const validate = service.phoneValidator();
    expect(validate(new FormControl('555123456'))).toBeNull();
    expect(validate(new FormControl('+995555123456'))).toBeNull();
    expect(validate(new FormControl('123'))).toEqual({ invalidPhone: true });
    expect(validate(new FormControl(''))).toBeNull();
  });
  it('shows required and email errors after touch', () => {
    const form = new FormGroup({
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
    });
    expect(service.getRequiredEmailError('emailAddress', form)).toBe('');
    form.markAllAsTouched();
    expect(service.getRequiredEmailError('emailAddress', form)).toBe('Email address is required');
    form.controls.emailAddress.setValue('invalid');
    expect(service.getRequiredEmailError('emailAddress', form)).toBe('Invalid email address.');
    expect(service.getRequiredError('missing', form)).toBe('');
  });
  it('formats length, amount, pattern, phone, date and password errors', () => {
    const control = new FormControl('value');
    const form = new FormGroup({ guestCount: control });
    control.markAsTouched();
    control.setErrors({
      minlength: { requiredLength: 8 },
      maxlength: { requiredLength: 20 },
      min: { min: 1 },
      max: { max: 50 },
      pattern: true,
      invalidPhone: true,
      invalidNumber: true,
      invalidDate: true,
    });
    expect(service.formatLabel('guestCount')).toBe('Guest count');
    expect(service.getMinLengthError('guestCount', form)).toContain('at least 8 characters');
    expect(service.getMaxLengthError('guestCount', form)).toContain('at most 20 characters');
    expect(service.getMinAmountError('guestCount', form)).toBe('Guest count must be at least 1');
    expect(service.getMaxAmountError('guestCount', form)).toBe('Guest count must be at most 50');
    expect(service.getRequiredAmountError('guestCount', form)).toBe(
      'Guest count must be at least 1',
    );
    expect(service.getRequiredMaxAmountError('guestCount', form)).toBe(
      'Guest count must be at most 50',
    );
    expect(service.getPatternError('guestCount', form, 'Whole numbers only')).toBe(
      'Whole numbers only',
    );
    expect(service.getPhoneError('guestCount', form)).toContain('valid phone number');
    expect(service.getRequiredPhoneNumberError('guestCount', form)).toContain('valid phone number');
    expect(service.getNumberError('guestCount', form)).toBe('Guest count must be at least 1');
    expect(service.getDateError('guestCount', form)).toBe('Enter a valid date.');
    form.setErrors({ passwordMismatch: true });
    expect(service.getPasswordMismatchError('guestCount', form)).toBe('Passwords do not match');
    expect(service.getFirstError('', 'First', 'Second')).toBe('First');
    expect(service.getFirstError('', '')).toBe('');
  });
});
