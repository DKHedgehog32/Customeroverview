import { LightningElement, api, track } from 'lwc';
import LOGO from '@salesforce/resourceUrl/WSRLogo';
import getCustomerOverview from '@salesforce/apex/WoonstadCustomerOverviewController.getCustomerOverview';

export default class WoonstadCustomerOverview extends LightningElement {
    @api recordId;
    logoUrl = LOGO;

    @track customerData;
    @track isLoading = true;
    @track error;

    @track showCases = false;
    @track showAddresses = false;
    @track showBankAccounts = false;
    @track showContracts = false;

    @track showCasesModal = false; // ✅ new modal toggle state

    connectedCallback() {
        if (this.recordId) {
            this.loadCustomerData();
        }
    }

    loadCustomerData() {
        this.isLoading = true;

        getCustomerOverview({ accountId: this.recordId })
            .then(result => {
                this.customerData = result;
                this.error = null;
            })
            .catch(err => {
                this.error = err;
                this.customerData = null;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    toggleCases = () => this.showCases = !this.showCases;
    toggleAddresses = () => this.showAddresses = !this.showAddresses;
    toggleBankAccounts = () => this.showBankAccounts = !this.showBankAccounts;
    toggleContracts = () => this.showContracts = !this.showContracts;

    openCasesModal() {
        this.showCasesModal = true;
    }

    closeCasesModal() {
        this.showCasesModal = false;
    }

    get account() {
        return this.customerData?.account;
    }

    get addresses() {
        return this.customerData?.addresses || [];
    }

    get bankAccounts() {
        return this.customerData?.bankAccounts || [];
    }

    get cases() {
        return this.customerData?.cases || [];
    }

    get contracts() {
        return this.customerData?.contracts || [];
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    // Removed console logging and debugging
}