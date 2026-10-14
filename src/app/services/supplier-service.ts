import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { QueryFormatterService } from './query-formatter-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ProductSectionSupplierDTO {
  id: number,
  name: string
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
}