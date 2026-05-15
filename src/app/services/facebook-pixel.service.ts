import { Injectable } from '@angular/core';
import { ThirdPartyScriptsService } from './third-party-scripts.service';

@Injectable({
    providedIn: 'root'
})
export class FacebookPixelService {
    constructor(private thirdPartyScripts: ThirdPartyScriptsService) { }

    scheduleLoad() {
        this.thirdPartyScripts.scheduleTrackingLoad();
    }

    trackPageView() {
        this.thirdPartyScripts.trackFacebookPageView();
    }

    trackStoreRedirect(
        store: 'ios' | 'android',
        position: 'top' | 'bottom'
    ) {
        this.thirdPartyScripts.trackFacebookStoreRedirect(store, position);
    }
}
