import { Component, input } from '@angular/core';

@Component({
  selector: 'app-register-validation-error-displayer',
  imports: [],
  templateUrl: './register-validation-error-displayer.html',
  styleUrl: './register-validation-error-displayer.scss',
})
export class RegisterValidationErrorDisplayer {
  readonly message = input('');
}
