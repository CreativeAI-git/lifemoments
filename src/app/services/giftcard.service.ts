import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GiftcardService {
  private apiUrl = 'http://192.168.1.3:4001/' + 'giftcard/purchase';

  constructor(private http: HttpClient) { }

  purchaseGiftcard(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, payload, { headers });
  }
}
