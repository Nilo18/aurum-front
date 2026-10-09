import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QueryFormatterService } from './query-formatter-service';
import { PageResponse } from './event-service';

export interface VehicleDTO {
  publicId: string;
  type: VehicleType;
  passengerCapacity: number;
  cargoWeightLimit: number;
}

export interface VehicleQuery {
  page?: number;
  size?: number;
  type?: VehicleType;
  passengerFrom?: number;
  passengerTo?: number;
  weightFrom?: number;
  weightTo?: number;
  sortBy?: string;
  sortDirection?: string;
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  PASSENGER_VEHICLE = 'PASSENGER_VEHICLE',
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);
  private queryFormatter = inject(QueryFormatterService);

  getVehicles(query: VehicleQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<VehicleDTO>>(`${this.baseUrl}/api/vehicle`, {
      params: httpParams,
    });
  }
}
