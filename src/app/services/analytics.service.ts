import { Injectable } from '@angular/core';
import { ThirdPartyScriptsService } from './third-party-scripts.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private thirdPartyScripts: ThirdPartyScriptsService) { }

  scheduleLoad() {
    this.thirdPartyScripts.scheduleTrackingLoad();
  }

  ensureLoaded() {
    this.thirdPartyScripts.ensureAnalyticsLoaded();
  }

  trackPageView(pagePath: string) {
    this.thirdPartyScripts.trackPageView(pagePath);
  }

  trackEvent(eventName: string, params?: any) {
    this.thirdPartyScripts.trackEvent(eventName, params);
  }
}
