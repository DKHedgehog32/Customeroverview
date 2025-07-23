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

    @track showCasesModal = false;

    connectedCallback() {
        if (this.recordId) {
            console.log('🔄 Connected with recordId:', this.recordId);
            this.loadCustomerData();
        } else {
            console.warn('⚠️ Geen recordId beschikbaar bij initialisatie.');
        }
    }

    loadCustomerData() {
        this.isLoading = true;
        console.log('📡 Ophalen klantgegevens voor recordId:', this.recordId);

        getCustomerOverview({ accountId: this.recordId })
            .then(result => {
                console.log('✅ Gegevens opgehaald:', JSON.stringify(result, null, 2));
                this.customerData = result;
                this.error = null;
            })
            .catch(err => {
                console.error('❌ Fout bij ophalen klantgegevens:', err);
                this.error = err;
                this.customerData = null;
            })
            .finally(() => {
                this.isLoading = false;
                console.log('✅ Ophalen klantgegevens afgerond. isLoading = false');
            });
    }

    toggleCases = () => this.showCases = !this.showCases;
    toggleAddresses = () => this.showAddresses = !this.showAddresses;
    toggleBankAccounts = () => this.showBankAccounts = !this.showBankAccounts;
    toggleContracts = () => this.showContracts = !this.showContracts;

    openCasesModal() {
        console.log('📂 Opening case modal...');
        console.log('📌 Account:', this.account);
        console.log('📌 Addresses:', this.addresses);
        console.log('📌 BankAccounts:', this.bankAccounts);
        console.log('📌 Cases:', this.cases);

        this.showCasesModal = true;
    }

    closeCasesModal() {
        console.log('❌ Closing case modal');
        this.showCasesModal = false;
    }

    get account() {
        const acc = this.customerData?.account;
        if (!acc) {
            console.warn('⚠️ Geen accountinformatie beschikbaar in customerData.');
        }
        return acc;
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
        console.log('🔙 Sluiten van klantoverzicht component');
        this.dispatchEvent(new CustomEvent('close'));
    }
}