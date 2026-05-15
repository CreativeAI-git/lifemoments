import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//const API_URL ='http://localhost:4000/'

// const API_URL = 'https://18.229.202.71:4000/'
const API_URL = 'https://lifesmomentsapp.com:4000/'

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(private http: HttpClient) { }

  createTree(url: any, family_id: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('Access-Control-Allow-Origin', '*');
    let authData = new URLSearchParams();
    authData.set('family_id', family_id);
    return this.http.post(API_URL + url, authData, { 'headers': headers })
  }

  createTree_2(url: any, formData: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('Access-Control-Allow-Origin', '*');
    return this.http.post(API_URL + url, formData, { 'headers': headers })
  }

  get(id: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('Access-Control-Allow-Origin', '*');
    let authData = new URLSearchParams();
    authData.set('id', id);
    return this.http.post(API_URL + 'getHumanOrPet', authData, { 'headers': headers })
  }

  postAPI<T, U>(url: string, data: U): Observable<T> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('Access-Control-Allow-Origin', '*');
    return this.http.post<T>(API_URL + url, data, { 'headers': headers })
  };
}
