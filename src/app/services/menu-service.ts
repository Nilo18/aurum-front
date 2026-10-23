import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { QueryFormatterService } from './query-formatter-service';
import { PageResponse } from './event-service';
import { GenericResponse } from './home-service';

export enum CuisineType {
  GEORGIAN = 'GEORGIAN',
  MEDITERRANEAN = 'MEDITERRANEAN',
  GENERAL = 'GENERAL',
}

export type MenuItemCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'DRINK';

export interface MenuItemDTO {
  publicId: string;
  name: string;
  type: CuisineType;
  category: MenuItemCategory;
  pricePerPerson: number;
}

export interface CreateMenuItemRequest {
  name: string;
  category: MenuItemCategory;
  type: CuisineType;
  pricePerPerson: number;
}

export interface MenuItemQuery {
  page?: number;
  size?: number;
  category?: MenuItemCategory;
  type?: CuisineType;
  priceFrom?: number;
  priceTo?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private queryFormatter = inject(QueryFormatterService);
  private backendUrlHolder = inject(BackendUrlHolderService);
  private baseUrl = this.backendUrlHolder.getBaseUrl();
  private http = inject(HttpClient);

  async getMenuItemsForRequestEventPage(type: CuisineType) {
    try {
      const res = await firstValueFrom(
        this.http.get<MenuItemDTO[]>(`${this.baseUrl}/api/menu/request-event`, {
          params: {
            cuisineType: type,
          },
        }),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't get menu items: ", error);
      throw error;
    }
  }

  getMenuItems(query: MenuItemQuery) {
    const cleanedQuery = this.queryFormatter.removeEmptyProperties(query);
    const httpParams = new HttpParams({ fromObject: cleanedQuery });
    return this.http.get<PageResponse<MenuItemDTO>>(`${this.baseUrl}/api/menu`, {
      params: httpParams,
    });
  }

  async addMenuItem(request: CreateMenuItemRequest) {
    try {
      const res = await firstValueFrom(
        this.http.post<MenuItemDTO>(`${this.baseUrl}/api/menu`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't add menu item: ", error);
      throw error;
    }
  }

  async updateMenuItem(request: MenuItemDTO) {
    try {
      const res = await firstValueFrom(
        this.http.put<MenuItemDTO>(`${this.baseUrl}/api/menu`, request),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't update menu item: ", error);
      throw error;
    }
  }

  async deleteMenuItem(publicId: string) {
    try {
      const res = await firstValueFrom(
        this.http.delete<GenericResponse>(`${this.baseUrl}/api/menu/${publicId}`),
      );
      console.log(res);
      return res;
    } catch (error) {
      console.log("Couldn't delete menu item: ", error);
      throw error;
    }
  }
}
