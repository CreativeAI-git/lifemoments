import { Injectable } from '@angular/core';

declare let fbq: Function;

@Injectable({
    providedIn: 'root'
})
export class FacebookPixelService {

    trackPageView() {
        if (typeof fbq !== 'undefined') {
            fbq('track', 'PageView');
        }
    }

    trackStoreRedirect(
        store: 'ios' | 'android',
        position: 'top' | 'bottom'
    ) {
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                store: store,
                button_position: position
            });

            fbq('trackCustom', 'App_Store_Click', {
                store: store,
                button_position: position
            });
        }
    }
}
