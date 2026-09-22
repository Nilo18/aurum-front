import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  saveToken(token: string) {
    localStorage.setItem('aurum_token', token)
  }

  getToken() {
    return localStorage.getItem('aurum_token')
  }
}
