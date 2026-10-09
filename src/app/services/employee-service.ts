import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GenericResponse } from './home-service';
import { AuthResponse } from './auth-service';
import { PageResponse } from './event-service';
import { QueryFormatterService } from './query-formatter-service';

export enum EmployeeRole {
  OWNER,
  ADMIN,
  STAFF,
}

export enum EmployeeType {
  SALES_MANAGER,
  CLIENT_MANAGER,
  PURCHASING_MANAGER,
  MUSICIAN,
  ACTOR,
  DRIVER,
  HOST,
  CHEF,
}

export enum EmployeeStatus {
  ACCEPTED,
  PENDING,
}

export interface InviteEmployeeRequest {
  type: EmployeeType;
  salary: number;
  email: string;
  role: EmployeeRole;
}

export interface CompleteInviteRegistrationRequest {
  token: string;
  name: string;
  password: string;
}

export interface EmployeeQuery {
  page?: number;
  size?: number;
  search?: string;
  role?: EmployeeRole;
  type?: EmployeeType;
  status?: EmployeeStatus;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC' | string;
}

export interface EmployeeDTO {
  specialty: EmployeeType;
  name: string;
  salary: number;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private queryFormatter = inject(QueryFormatterService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  async inviteEmployee(request: InviteEmployeeRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<GenericResponse>(`${this.baseUrl}/api/employee/invite`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't invite employee: ", error);
      throw error;
    }
  }

  async validateInvitation(token: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<GenericResponse>(`${this.baseUrl}/api/employee/validate-invite`, { token }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't validate invitation: ", error);
      throw error;
    }
  }

  async completeRegistration(request: CompleteInviteRegistrationRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/api/employee/register`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't complete registration: ", error);
      throw error;
    }
  }

  getEmployees(query: EmployeeQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<EmployeeDTO>>(`${this.baseUrl}/api/employee`, {
      params: httpParams,
    });
  }

  async deleteEmployee(email: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete<GenericResponse>(`${this.baseUrl}/api/employee`, {
          body: { email },
        }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Coudln't delete employee: ", error);
      throw error;
    }
  }
}
