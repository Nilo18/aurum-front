import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from './event-service';

export interface ProductSectionSupplierDTO {
  publicId: string,
  name: string
}

export enum ProductCategory {
  TABLEWARE = 'TABLEWARE',
  GLASSWARE = 'GLASSWARE',
  FLORALS = 'FLORALS',
  DECORATION = 'DECORATION',
  FOOD_INGREDIENT = 'FOOD_INGREDIENT'
}

export interface SupplierQuery {
  page: number;
  size: number;
  productType?: ProductCategory;
  sortBy: string;
  sortDirection: string;
  search: string;
}

export interface SupplierDTO {
  publicId: string;
  name: string;
  categories: Set<ProductCategory>; // Alternatively: Set<ProductCategory>
  city: string;
  street: string;
  number: string;
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
      const res = await firstValueFrom(this.http.get<ProductSectionSupplierDTO[]>(`${this.baseUrl}/api/supplier/names`))
      console.log(res)
      return res
    } catch (error) {
      console.log("Couldn't get supplier names")
      throw error
    }
  }

  getSuppliers(query: SupplierQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query)
    const httpParams = new HttpParams({ fromObject: cleanedQuery })
    return this.http.get<PageResponse<SupplierDTO>>(`${this.baseUrl}/api/supplier`, {
      params: httpParams
    })
  }
}