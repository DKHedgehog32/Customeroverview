import { LightningElement, api, track } from 'lwc';
import LOGO from '@salesforce/resourceUrl/WSRLogo';
import getCustomerOverview from '@salesforce/apex/WoonstadCustomerOverviewController.getCustomerOverview';

export default class WoonstadCaseModal extends LightningElement {
    @api account;
    @api addresses;
    @api bankAccounts;
    @api cases;

    logoUrl = LOGO;
    @track showFlowModal = false;

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleNewCase() {
        this.showFlowModal = true;
    }

    closeFlowModal() {
        this.showFlowModal = false;
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.showFlowModal = false;
            this.refreshCases();
        }
    }

    get flowInput() {
    // Ensure a non-null string is passed to the flow
    if (this.account?.Id) {
        return [
            {
                name: 'recordId',
                type: 'String',
                value: this.account.Id
            }
        ];
    }
    // Optional: Log or return empty to prevent crash
    console.warn('⚠️ recordId is null. Flow will not receive input.');
    return [];
}

    refreshCases() {
        getCustomerOverview({ accountId: this.account?.Id })
            .then(result => {
                this.cases = result.cases;
            })
            .catch(error => {
                console.error('Fout bij ophalen zaken:', error);
            });
    }
}