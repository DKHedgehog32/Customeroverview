import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import LOGO from '@salesforce/resourceUrl/WSRlogo';

export default class WoonstadCommandCentre extends NavigationMixin(LightningElement) {
    @track showCustomerSearchModal = false;
    @track showCreateCustomerWizardModal = false;
    @track showCustomerOverviewModal = false;
    @track selectedAccountId = null;
    logoUrl = LOGO;

    handleTileClick(event) {
        const target = event.currentTarget.dataset.target;
        console.log('🔘 Tile clicked:', target);

        // 🔁 Reset all modals before opening
        this.showCustomerSearchModal = false;
        this.showCreateCustomerWizardModal = false;
        this.showCustomerOverviewModal = false;

        switch (target) {
            case 'zoekKlanten':
                console.log('📂 Opening Zoek Klanten modal...');
                setTimeout(() => {
                    this.showCustomerSearchModal = true;
                }, 0);
                break;

            case 'aanvraag':
                console.log('📤 Navigating to Aanvraag Flow');
                this[NavigationMixin.Navigate]({
                    type: 'standard__flow',
                    attributes: { flowApiName: 'AanvraagFlow' }
                });
                break;

            case 'vraag':
                console.log('❓ Navigating to Ik Heb Een Vraag component');
                this[NavigationMixin.Navigate]({
                    type: 'standard__component',
                    attributes: { componentName: 'c__ikHebEenVraag' }
                });
                break;

            default:
                console.warn('⚠️ Unknown tile target:', target);
        }
    }

    closeCustomerSearchModal() {
        console.log('❌ Closing Customer Search modal');
        this.showCustomerSearchModal = false;
    }

    handleCreateNew() {
        console.log('⚡ createCustomer event received');
        this.showCustomerSearchModal = false;
        this.showCreateCustomerWizardModal = true;
    }

    closeCreateCustomerWizardModal() {
        console.log('❌ Closing Customer Wizard modal');
        this.showCreateCustomerWizardModal = false;
    }

    handleBackToCustomerSearch() {
        console.log('🔁 Going back to Customer Search from Wizard');
        this.showCreateCustomerWizardModal = false;
        this.showCustomerSearchModal = true;
    }

    // ✅ From zoekresultaat → Klantoverzicht
    handleOpenOverview(event) {
        const accountId = event.detail.accountId;
        console.log('📬 handleOpenOverview received ID:', accountId);
        if (!accountId) return;

        this.selectedAccountId = accountId;
        this.showCustomerSearchModal = false;
        this.showCustomerOverviewModal = true;
    }

    closeCustomerOverviewModal() {
        console.log('❌ Closing Customer Overview modal');
        this.showCustomerOverviewModal = false;
    }

    handleShowCustomerOverview(event) {
        console.log('✅ Received showoverview for:', event.detail.accountId);
        this.selectedAccountId = event.detail.accountId;
        this.showCustomerSearchModal = false;
        this.showCustomerOverviewModal = true;
    }
}