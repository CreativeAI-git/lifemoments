import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent {

  showBanner = false;

  constructor(
    private cookieService: CookieConsentService,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    if (!this.cookieService.hasUserResponded()) {
      this.showBanner = true;
    }
  }

  accept() {
    this.cookieService.accept();
    this.showBanner = false;
    this.analytics.ensureLoaded();
  }

  reject() {
    this.cookieService.reject();
    this.showBanner = false;
  }
}
