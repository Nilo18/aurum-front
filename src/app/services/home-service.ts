import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BackendUrlHolderService } from './backend-url-holder-service';

export interface OtpResponse {
  transactionKey: string,
  otp: string
}

export interface ContactRequest {
  /** 
   * @required Cannot be blank
   * @maxLength 255 characters
   */
  fullName: string;

  /** 
   * @required Cannot be blank
   * Must be a valid phone number format
   */
  phoneNumber: string;

  /** 
   * @required Cannot be blank
   * Must be a valid email format
   */
  emailAddress: string;

  /** @required Cannot be blank */
  message: string;

  /** @required Cannot be blank */
  transactionKey: string;

  /** @required Cannot be blank */
  otp: string;
}

export interface GenericResponse {
  status: number,
  message: string
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private httpClient = inject(HttpClient)
  private backendUrlHolder = inject(BackendUrlHolderService)

  async verifyContactRequest(email: string) {
    // console.log(`Sending to: ${this.backendUrlHolder}/verify-contact-request`)
    // console.log('This: ',  { email })
    try {
      const res = await firstValueFrom(this.httpClient.post<OtpResponse>(
        `${this.backendUrlHolder.getBaseUrl()}/verify-contact-request`, { email }
      ))
      console.log(res)
      return res;
    } catch (error) {
      console.log("Couldn't send contact request verification: ", error)
      throw error;
    }
  }

  async sendContactMessage(contact: ContactRequest) {
    try {
      const res = await firstValueFrom(this.httpClient.post<GenericResponse>(
        `${this.backendUrlHolder.getBaseUrl()}/contact`, contact
      ))
      return res
    } catch (error) {
      console.log("Couldn't send contact message: ", error)
      throw error
    }
  }
}
