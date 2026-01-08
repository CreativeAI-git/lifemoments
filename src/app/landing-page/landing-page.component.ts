import { Component } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  constructor(private cookieService: CookieConsentService, private fbPixel: FacebookPixelService) { }

  ngOnInit() {
    if (this.cookieService.getConsentStatus() === 'accepted') {
      this.loadAnalytics();
    }
  }

  loadAnalytics() {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    script.async = true;
    document.body.appendChild(script);
  }

  redirectToStore(
    store: 'ios' | 'android',
    position: 'top' | 'bottom',
    url: string
  ) {
    this.fbPixel.trackStoreRedirect(store, position);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  }
}
