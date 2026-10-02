import { inject, Injectable, signal } from '@angular/core';
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
  private employeeQuery = signal<EmployeeQuery>({
    page: 0,
    size: 10,
    search: '',
    sortBy: '',
    sortDirection: '',
  });

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

  getEmployeeQuery() {
    return this.employeeQuery.asReadonly();
  }

  searchEmployees(search: string) {
    this.employeeQuery.update((query) => ({ ...query, search, page: 0 }));
    return this.getEmployees();
  }

  filterEmployees(filters: Pick<EmployeeQuery, 'type' | 'role' | 'status'>) {
    this.employeeQuery.update((query) => ({ ...query, ...filters, page: 0 }));
    return this.getEmployees();
  }

  sortEmployees(sortBy: string, sortDirection: string) {
    this.employeeQuery.update((query) => ({ ...query, sortBy, sortDirection, page: 0 }));
    return this.getEmployees();
  }

  paginateEmployees(page: number, size?: number) {
    this.employeeQuery.update((query) => ({ ...query, page, size: size ?? query.size }));
    return this.getEmployees();
  }

  getEmployees() {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(this.employeeQuery());
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return firstValueFrom(
      this.http.get<PageResponse<EmployeeDTO>>(`${this.baseUrl}/api/employee`, {
        params: httpParams,
      }),
    );
  }
}
