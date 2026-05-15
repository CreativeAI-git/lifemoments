import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CookieConsentService } from '../services/cookie-consent.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';
import { AnalyticsService } from '../services/analytics.service';
import { CookieConsentComponent } from '../cookie-consent/cookie-consent.component';
import { ThirdPartyScriptsService } from '../services/third-party-scripts.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, CookieConsentComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoIframe') videoIframe?: ElementRef<HTMLIFrameElement>;

  scroll25 = false;
  scroll50 = false;
  scroll75 = false;
  scroll90 = false;
  player: any;
  videoStarted = false;
  videoCompleted = false;
  private videoObserver?: IntersectionObserver;
  private playerInitialized = false;

  constructor(
    private cookieService: CookieConsentService,
    private fbPixel: FacebookPixelService,
    private analytics: AnalyticsService,
    private thirdPartyScripts: ThirdPartyScriptsService
  ) { }

  ngOnInit() {
    if (this.cookieService.getConsentStatus() === 'accepted') {
      this.analytics.ensureLoaded();
    }
  }

  ngAfterViewInit() {
    this.setupDeferredVideo();
  }

  ngOnDestroy() {
    this.videoObserver?.disconnect();
  }

  redirectToStore(
    store: 'ios' | 'android',
    position: 'top' | 'bottom',
    url: string
  ) {

    this.fbPixel.trackStoreRedirect(store, position);

    this.analytics.trackEvent(
      store === 'ios' ? 'app_store_click' : 'google_play_click',
      {
        button_position: position,
        store_type: store,
        page_url: window.location.href
      }
    );

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
    this.analytics.trackEvent('scroll_depth', {
      percent_scrolled: percent,
      page_url: window.location.href
    });
  }

  primeVideoLoad() {
    this.activateVideo();
  }

  private setupDeferredVideo() {
    const iframe = this.videoIframe?.nativeElement;
    if (!iframe) {
      return;
    }

    const triggerVideoLoad = () => this.activateVideo();

    iframe.addEventListener('pointerenter', triggerVideoLoad, { once: true });
    iframe.addEventListener('focus', triggerVideoLoad, { once: true });
    iframe.addEventListener('touchstart', triggerVideoLoad, { once: true, passive: true });

    if (typeof IntersectionObserver === 'undefined') {
      triggerVideoLoad();
      return;
    }

    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activateVideo();
          this.videoObserver?.disconnect();
        }
      });
    }, {
      rootMargin: '300px 0px'
    });

    this.videoObserver.observe(iframe);
  }

  private activateVideo() {
    const iframe = this.videoIframe?.nativeElement;
    if (!iframe) {
      return;
    }

    const deferredSrc = iframe.dataset['src'];
    if (deferredSrc && iframe.src !== deferredSrc) {
      iframe.src = deferredSrc;
    }

    this.initializeYoutubePlayer();
  }

  private async initializeYoutubePlayer() {
    if (this.playerInitialized) {
      return;
    }

    await this.thirdPartyScripts.ensureYoutubeIframeApiLoaded();

    if (!window.YT?.Player) {
      return;
    }

    this.playerInitialized = true;
    this.player = new window.YT.Player('ct_video_iframe', {
      events: {
        onStateChange: (event: any) => this.onPlayerStateChange(event)
      }
    });
  }

  onPlayerStateChange(event: any) {
    if (event.data === 1 && !this.videoStarted) {
      this.videoStarted = true;
      this.analytics.trackEvent('video_play', {
        video_title: 'Life Moments Demo',
        page_url: window.location.href
      });
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

  trackSocialClick(platform: string) {
    this.analytics.trackEvent('social_click', {
      social_platform: platform,
      page_url: window.location.href
    });
  }
}
