import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from './event-service';
import { GenericResponse } from './home-service';

export interface ProductSectionSupplierDTO {
  publicId: string;
  name: string;
}

export enum ProductCategory {
  TABLEWARE = 'TABLEWARE',
  GLASSWARE = 'GLASSWARE',
  FLORALS = 'FLORALS',
  DECORATION = 'DECORATION',
  FOOD_INGREDIENT = 'FOOD_INGREDIENT',
}

export interface SupplierQuery {
  page?: number;
  size?: number;
  productType?: ProductCategory;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}

export interface SupplierDTO {
  publicId: string;
  name: string;
  categories: Set<ProductCategory>;
  city: string;
  street: string;
  number: string;
}

export interface CreateSupplierRequest {
  name: string;
  city: string;
  street: string;
  number: string;
  categories: Set<ProductCategory>;
}

export interface UpdateSupplierRequest {
  publicId: string;
  name: string;
  city: string;
  street: string;
  number: string;
  categories: Set<ProductCategory>;
}

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private queryFormatter = inject(QueryFormatterService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  async getSupplierNames() {
    try {
      const res = await firstValueFrom(
        this.http.get<ProductSectionSupplierDTO[]>(`${this.baseUrl}/api/supplier/names`),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't get supplier names");
      throw error;
    }
  }

  getSuppliers(query: SupplierQuery) {
    console.log('Fetching suppliers...');
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<SupplierDTO>>(`${this.baseUrl}/api/supplier`, {
      params: httpParams,
    });
  }

  async getAvailableProductCategories() {
    try {
      const res = await firstValueFrom(
        this.http.get<Set<ProductCategory>>(`${this.baseUrl}/api/supplier/available-categories`),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't get available product categories: ", error);
      throw error;
    }
  }

  async addSupplier(request: CreateSupplierRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<SupplierDTO>(`${this.baseUrl}/api/supplier`, {
          ...request,
          categories: Array.from(request.categories),
        }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't add supplier: ", error);
      throw error;
    }
  }

  async updateSupplier(request: UpdateSupplierRequest) {
    try {
      const res = await firstValueFrom(
        this.http.put<SupplierDTO>(`${this.baseUrl}/api/supplier`, {
          ...request,
          categories: Array.from(request.categories),
        }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't update supplier: ", error);
      throw error;
    }
  }

  async deleteSupplier(publicId: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete<GenericResponse>(`${this.baseUrl}/api/supplier/${publicId}`),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't delete supplier: ", error);
      throw error;
    }
  }
}
