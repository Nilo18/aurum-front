import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../services/employee-service';
import { RegistrationForm } from '../../components/register-page-components/registration-form/registration-form';
import { LoaderComponent } from '../../components/general-components/loader-component/loader-component';
import { RegisterValidationErrorDisplayer } from '../../components/register-page-components/register-validation-error-displayer/register-validation-error-displayer';

@Component({
  selector: 'app-register',
  imports: [LoaderComponent, RegisterValidationErrorDisplayer, RegistrationForm],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  validating: WritableSignal<boolean> = signal(true);
  validationFailed: WritableSignal<boolean> = signal(false);
  validationErrorMsg: WritableSignal<string> = signal('');
  token!: string | null;

  async ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (!token) {
        console.log('Token is missing.');
        this.validationErrorMsg.set(
          'Your invitation link is missing. Please open the complete registration link from your invitation email, or contact your administrator for a new invitation.',
        );
        this.validationFailed.set(true);
        this.validating.set(false);
        return;
      }

      this.token = token;
      console.log('Token detected: ', this.token);
    });

    if (this.token) {
      try {
        const res = await this.employeeService.validateInvitation(this.token);
        if (res.status === 200) {
          this.validating.set(false);
          // this.router.navigate([], {
          //   relativeTo: this.route,
          //   queryParams: {},
          //   queryParamsHandling: null
          // })
        }
      } catch (error: any) {
        this.validationFailed.set(true);
        this.validationErrorMsg.set(error.error.error);
      }
    }
  }
}
