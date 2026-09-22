import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  saveToken(token: string) {
    try {
      if (!token?.trim()) return false;
      localStorage.setItem('auth_token', token);
      return true;
    } catch {
      return false;
    }
  }

  getToken() {
    return localStorage.getItem('aurum_token')
  }
}
