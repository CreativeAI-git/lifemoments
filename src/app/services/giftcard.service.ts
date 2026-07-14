import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GiftcardService {
  private apiUrl = 'https://lifesmomentsapp.com:4000/';

  constructor(private http: HttpClient) { }

  purchaseGiftcard(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl + 'giftcard/purchase', payload, { headers });
  }

  payment(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl + 'giftcard/payment', payload, { headers });
  }
}
