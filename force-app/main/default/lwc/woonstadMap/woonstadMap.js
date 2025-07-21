import { LightningElement, api } from 'lwc';

export default class WoonstadMap extends LightningElement {
    @api address;

    get mapSrc() {
        // Replace spaces with + and encode address for the URL
        const encodedAddress = encodeURIComponent(this.address || '');
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
    }
}