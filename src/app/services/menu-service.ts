import { inject, Injectable } from '@angular/core';
import { BackendUrlHolderService } from './backend-url-holder-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export enum CuisineType {
  GEORGIAN = 'GEORGIAN',
  MEDITERRANEAN = 'MEDITERRANEAN', 
  GENERAL = 'GENERAL'
}

export type MenuItemCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'DRINK';

export interface MenuItem {
  id: number
  name: string,
  category: MenuItemCategory, 
  pricePerPerson: number 
};

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private backendUrlHolder = inject(BackendUrlHolderService)
  private baseUrl = this.backendUrlHolder.getBaseUrl()
  private http = inject(HttpClient)

  async getMenuItems(type: CuisineType) {
    try {
      const res = await firstValueFrom(this.http.get<MenuItem[]>(`${this.baseUrl}/api/menu`, {
        params: {
          cuisineType: type
        }
      }))
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't get menu items: ", error)
      throw error
    }
  }
}
