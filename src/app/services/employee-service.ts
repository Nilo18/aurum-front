import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GenericResponse } from './home-service';
import { AuthResponse } from './auth-service';

export enum EmployeeRole { OWNER, ADMIN, STAFF }

export enum EmployeeType {
  SALES_MANAGER,
  CLIENT_MANAGER,
  PURCHASING_MANAGER,
  MUSICIAN,
  ACTOR,
  DRIVER,
  HOST,
  CHEF
}

export interface InviteEmployeeRequest {
  type: EmployeeType
  salary: number,
  email: string,
  role: EmployeeRole
}

export interface CompleteInviteRegistrationRequest {
  token: string;
  name: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)

  async inviteEmployee(request: InviteEmployeeRequest) {
    try {
      const res = await firstValueFrom(this.http.post<GenericResponse>(
        `${this.baseUrl}/api/employee/invite`, request)
      )
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't invite employee: ", error)
      throw error
    }
  }

  async validateInvitation(token: string) {
    try {
      const res = await firstValueFrom(this.http.post<GenericResponse>(
        `${this.baseUrl}/api/employee/validate-invite`, { token })
      )
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't validate invitation: ", error)
      throw error
    }
  }

  async completeRegistration(request: CompleteInviteRegistrationRequest) {
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(
        `${this.baseUrl}/api/employee/register`, request)
      )
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't complete registration: ", error)
      throw error
    }
  }
}
