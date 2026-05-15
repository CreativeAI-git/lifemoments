import { Injectable } from '@angular/core';

declare global {
  interface Window {
    dataLayer: unknown[];
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    gtag?: (...args: any[]) => void;
    YT?: {
      Player: new (elementId: string, options: Record<string, unknown>) => unknown;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type FbqFunction = ((...args: any[]) => void) & {
  callMethod?: (...args: any[]) => void;
  queue?: any[];
  push?: (...args: any[]) => void;
  loaded?: boolean;
  version?: string;
};

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyScriptsService {
  private readonly gaMeasurementId = 'G-Q3XHYTLPCE';
  private readonly facebookPixelId = '846292678393251';
  private gaLoaded = false;
  private gaStubInitialized = false;
  private gaConfigSent = false;
  private facebookLoaded = false;
  private facebookStubInitialized = false;
  private youtubeApiPromise?: Promise<void>;

  scheduleTrackingLoad(): void {
    this.initializeAnalyticsStub();
    this.initializeFacebookStub();

    const loadScripts = () => {
      this.ensureAnalyticsLoaded();
      this.ensureFacebookPixelLoaded();
    };

    if (typeof window === 'undefined') {
      loadScripts();
      return;
    }

    if ('requestIdleCallback' in window) {
      (window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void;
      }).requestIdleCallback(loadScripts, { timeout: 2500 });
      return;
    }

    globalThis.setTimeout(loadScripts, 1500);
  }

  ensureAnalyticsLoaded(): void {
    this.initializeAnalyticsStub();

    if (this.gaLoaded) {
      return;
    }

    this.gaLoaded = true;
    this.appendScript(
      `https://www.googletagmanager.com/gtag/js?id=${this.gaMeasurementId}`,
      'ga4-script'
    );
    this.sendAnalyticsConfig();
  }

  trackPageView(pagePath: string): void {
    this.initializeAnalyticsStub();
    this.sendAnalyticsConfig();

    window.gtag?.('event', 'page_view', {
      page_path: pagePath
    });
  }

  trackEvent(eventName: string, params?: Record<string, unknown>): void {
    this.initializeAnalyticsStub();
    this.sendAnalyticsConfig();

    window.gtag?.('event', eventName, params);
  }

  ensureFacebookPixelLoaded(): void {
    this.initializeFacebookStub();

    if (this.facebookLoaded) {
      return;
    }

    this.facebookLoaded = true;
    this.appendScript('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel-script');
    window.fbq?.('init', this.facebookPixelId);
  }

  trackFacebookPageView(): void {
    this.initializeFacebookStub();
    this.ensureFacebookPixelLoaded();
    window.fbq?.('track', 'PageView');
  }

  trackFacebookStoreRedirect(
    store: 'ios' | 'android',
    position: 'top' | 'bottom'
  ): void {
    this.initializeFacebookStub();
    this.ensureFacebookPixelLoaded();

    window.fbq?.('track', 'Lead', {
      store,
      button_position: position
    });

    window.fbq?.('trackCustom', 'App_Store_Click', {
      store,
      button_position: position
    });
  }

  ensureYoutubeIframeApiLoaded(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    if (window.YT?.Player) {
      return Promise.resolve();
    }

    if (!this.youtubeApiPromise) {
      this.youtubeApiPromise = new Promise<void>((resolve) => {
        const previousReady = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          previousReady?.();
          resolve();
        };

        this.appendScript('https://www.youtube.com/iframe_api', 'youtube-iframe-api');
      });
    }

    return this.youtubeApiPromise;
  }

  private initializeAnalyticsStub(): void {
    if (this.gaStubInitialized) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    this.gaStubInitialized = true;
  }

  private sendAnalyticsConfig(): void {
    if (this.gaConfigSent) {
      return;
    }

    window.gtag?.('config', this.gaMeasurementId, {
      send_page_view: false
    });
    this.gaConfigSent = true;
  }

  private initializeFacebookStub(): void {
    if (this.facebookStubInitialized) {
      return;
    }

    const fbq = function (...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue?.push(args);
    } as FbqFunction;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = (...args: any[]) => {
      fbq.queue?.push(args);
    };

    window.fbq = window.fbq || fbq;
    window._fbq = window._fbq || window.fbq;
    this.facebookStubInitialized = true;
  }

  private appendScript(src: string, id: string): void {
    if (document.getElementById(id)) {
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
}
