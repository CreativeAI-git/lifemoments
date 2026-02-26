import { Injectable } from '@angular/core';
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  trackEvent(eventName: string, params?: any) {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  }
}
