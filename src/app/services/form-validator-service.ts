import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

@Injectable({
  providedIn: 'root',
})
export class FormValidatorService {
  phoneValidator(defaultCountry: CountryCode = 'GE'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value

      if (!value) {
        return null
      }

      try {
        const phoneNumber = parsePhoneNumberFromString(value, defaultCountry)

        if (phoneNumber && phoneNumber.isValid()) {
          return null
        }
      } catch (error) {
        
      }

      return { invalidPhone: true }
    }
  }

  formatLabel(field: string): string {
    return field
      .replace(/_/g, ' ')                        
      .replace(/^\w/, c => c.toUpperCase());    
  }

  getRequiredError(label: string, form: FormGroup): string {
    const control = form.get(label)

    if (!control || !control.touched) return ''

    return control.hasError('required') ? `${this.formatLabel(label)} is required` : ''
  }

  getEmailError(field: string, form: FormGroup): string {
    const control = form.get(field)

    if (!control || !control.touched) return ''

    return control.hasError('email') ? 'Invalid email address.' : ''
  }

  getMinLengthError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    const control = form.get(field)

    if (!control || !control.touched || !control.hasError('minlength')) return ''

    const minLengthError = control.getError('minlength') as { requiredLength: number }

    return `${label} must be at least ${minLengthError.requiredLength} characters long`
  }

  getMaxLengthError(field: string, form: FormGroup): string {
    const control = form.get(field)

    if (!control || !control.touched || !control.hasError('maxlength')) return ''

    const maxLengthError = control.getError('maxlength') as { requiredLength: number }

    return `${this.formatLabel(field)} must be at most ${maxLengthError.requiredLength} characters long`
  }

  getPatternError(field: string, form: FormGroup, message = 'Pattern mismatch'): string {
    const control = form.get(field)

    if (!control || !control.touched) return ''

    return control.hasError('pattern') ? message : ''
  }

  getPasswordMismatchError(field: string, form: FormGroup): string {
    const control = form.get(field)

    if (!control || !control.touched) return ''

    return form.hasError('passwordMismatch') ? 'Passwords do not match' : ''
  }

  getFirstError(...errors: string[]): string {
    return errors.find(Boolean) ?? ''
  }

  getMinAmountError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    const control = form.get(field)

    if (!control || !control.hasError('min')) return ''

    const minAmountError = control.getError('min') as { min: number; actual: number }

    return `${label} must be at least ${minAmountError.min}`
  }

  getMaxAmountError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    const control = form.get(field)

    if (!control || !control.hasError('max')) return ''

    const maxAmountError = control.getError('max') as { max: number; actual: number }

    return `${label} must be at most ${maxAmountError.max}`
  }

  getRequiredAmountError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    return this.getFirstError(
      this.getRequiredError(field, form),
      this.getMinAmountError(field, form, label),
      this.getMaxAmountError(field, form, label)
    )
  }

  getRequiredMaxAmountError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    return this.getFirstError(
      this.getRequiredError(field, form),
      this.getMaxAmountError(field, form, label)
    )
  }

  getRequiredEmailError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    return this.getFirstError(
      this.getRequiredError(field, form),
      this.getEmailError(field, form)
    )
  }

  getRequiredPhoneNumberError(field: string, form: FormGroup, label = this.formatLabel(field)): string {
    return this.getFirstError(
      this.getRequiredError(field, form),
      this.getPhoneError(field, form)
    )
  }

  getPhoneError(field: string, form: FormGroup): string {
    const control = form.get(field);

    if (!control || !control.touched || !control.hasError('invalidPhone')) {
      return '';
    }

    const phoneError = control.getError('invalidPhone');
    const label = this.formatLabel(field);

    if (phoneError?.example) {
      return `${label} is invalid. Expected format: ${phoneError.example}`;
    }

    return `${label} must be a valid phone number with a correct country code`;
  }

  nonWhitespaceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value
    return typeof value === 'string' && value.length > 0 && value.trim().length === 0
      ? { whitespace: true }
      : null
  }

  finiteNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value
    return value === '' || value === null || (typeof value === 'number' && Number.isFinite(value))
      ? null
      : { invalidNumber: true }
  }

  validDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value
    if (!value) return null
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { invalidDate: true }
    }

    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? null
      : { invalidDate: true }
  }
}
