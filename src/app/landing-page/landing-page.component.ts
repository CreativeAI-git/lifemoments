import { Component } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';
import { AnalyticsService } from '../services/analytics.service';
import { HostListener } from '@angular/core';
declare var YT: any;

declare global {
  interface Window {
    YT: any;
  }
}
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  scroll25 = false;
  scroll50 = false;
  scroll75 = false;
  scroll90 = false;
  player: any;
  videoStarted = false;
  videoCompleted = false;
  constructor(private cookieService: CookieConsentService, private fbPixel: FacebookPixelService, private analytics: AnalyticsService) { }

  ngOnInit() {
    if (this.cookieService.getConsentStatus() === 'accepted') {
      this.loadAnalytics();
    }
  }

  ngAfterViewInit() {
    this.loadYoutubePlayer();
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

    if (window.gtag) {
      window.gtag('event',
        store === 'ios' ? 'app_store_click' : 'google_play_click',
        {
          button_position: position,
          store_type: store,
          page_url: window.location.href
        }
      );
    }
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  }
  @HostListener('window:scroll', [])

  onWindowScroll() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    this.trackScroll(scrollPercent);
  }

  trackScroll(percent: number) {

    if (percent >= 25 && !this.scroll25) {
      this.sendScrollEvent(25);
      this.scroll25 = true;
    }

    if (percent >= 50 && !this.scroll50) {
      this.sendScrollEvent(50);
      this.scroll50 = true;
    }

    if (percent >= 75 && !this.scroll75) {
      this.sendScrollEvent(75);
      this.scroll75 = true;
    }

    if (percent >= 90 && !this.scroll90) {
      this.sendScrollEvent(90);
      this.scroll90 = true;
    }
  }

  sendScrollEvent(percent: number) {
    if (window.gtag) {
      window.gtag('event', 'scroll_depth', {
        percent_scrolled: percent,
        page_url: window.location.href
      });
    }
  }

  loadYoutubePlayer() {
    const checkYT = setInterval(() => {
      if (window['YT'] && window['YT'].Player) {
        clearInterval(checkYT);

        this.player = new YT.Player('ct_video_iframe', {
          events: {
            onStateChange: (event: any) => this.onPlayerStateChange(event)
          }
        });
      }
    }, 500);
  }

  onPlayerStateChange(event: any) {
    if (event.data === 1 && !this.videoStarted) {
      this.videoStarted = true;

      if (window.gtag) {
        window.gtag('event', 'video_play', {
          video_title: 'Life Moments Demo',
          page_url: window.location.href
        });
      }
    }

    // if (event.data === 0 && !this.videoCompleted) {
    //   this.videoCompleted = true;
    //   if (window.gtag) {
    //     window.gtag('event', 'video_complete', {
    //       video_title: 'Life Moments Demo',
    //       page_url: window.location.href
    //     });
    //   }
    // }
  }
}
