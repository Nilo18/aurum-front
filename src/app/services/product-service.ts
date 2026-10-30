import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from './event-service';
import { GenericResponse } from './home-service';
import { firstValueFrom } from 'rxjs';
import { ProductSectionSupplierDTO } from './supplier-service';

export enum ProductCategory {
  TABLEWARE = 'TABLEWARE',
  GLASSWARE = 'GLASSWARE',
  FLORALS = 'FLORALS',
  DECORATION = 'DECORATION',
  FOOD_INGREDIENT = 'FOOD_INGREDIENT',
}

export interface ProductQuery {
  page?: number;
  size?: number;
  productCategory?: ProductCategory;
  priceFrom?: number;
  priceTo?: number;
  supplierId?: number;
  quantityFrom?: number;
  quantityTo?: number;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}

export interface ProductDTO {
  publicId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  supplierId: string;
  quantity: number;
}

export interface ProductRowDTO {
  publicId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  supplier: ProductSectionSupplierDTO;
  quantity: number;
}

export interface CreateProductRequest {
  productName: string;
  category: ProductCategory;
  price: number;
  supplierPublicId: string;
  quantity: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
  publicId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private backendUrlHolder = inject(BackendUrlHolderService);
  private queryFormatter = inject(QueryFormatterService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  getProducts(query: ProductQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<ProductRowDTO>>(`${this.baseUrl}/api/product`, {
      params: httpParams,
    });
  }

  async addProduct(request: CreateProductRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<ProductDTO>(`${this.baseUrl}/api/product`, request),
      );

      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(request: UpdateProductRequest) {
    try {
      const res = await firstValueFrom(
        this.http.put<ProductDTO>(`${this.baseUrl}/api/product`, request),
      );

      return res;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(publicId: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete<GenericResponse>(`${this.baseUrl}/api/product/${publicId}`),
      );

      return res;
    } catch (error) {
      throw error;
    }
  }
}
