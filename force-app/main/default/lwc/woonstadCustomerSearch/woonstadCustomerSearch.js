import { LightningElement, track } from 'lwc';
import searchAccountsByName from '@salesforce/apex/WoonstadCustomerSearchController.searchAccountsByName';
import LOGO from '@salesforce/resourceUrl/WSRLogo';

export default class WoonstadCustomerSearch extends LightningElement {
    @track searchTerm = '';
    @track accounts = [];
    @track noResults = false;
    hoveredAccountId = null;

    logoUrl = LOGO;

    // Update search term as user types
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
    }

    // Search when user presses Enter
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.searchAccounts();
        }
    }

    // Perform search using Apex method
    searchAccounts() {
        const input = this.searchTerm?.trim();
        console.log('🔍 Starting search with input:', input);

        if (!input || input.length < 3) {
            console.log('⚠️ Search term too short or empty.');
            this.accounts = [];
            this.noResults = false;
            return;
        }

        searchAccountsByName({ name: input })
            .then(result => {
                console.log('📦 Apex result received:', result);

                const sorted = result;

                this.accounts = sorted.map(acc => {
                    let caseTooltip = 'Geen open zaken gevonden.';
                    if (acc.Cases && acc.Cases.length > 0) {
                        caseTooltip = acc.Cases.map(c =>
                            `${c.CaseNumber || ''} - ${c.CaseReason || ''} - ${c.Status || ''} - ${c.WocasNumber || ''} - ${c.Subject || ''} - ${c.Description || ''}`
                        ).join('\n');
                    }

                    return {
                        Id: acc.Id,
                        Name: acc.Name,
                        PersonBirthdate: acc.PersonBirthdate || '',
                        Phone: acc.Phone || '',
                        MaskedIban: acc.MaskedIban || '',
                        AddressName: acc.AddressName || '',
                        PostalCode: acc.PostalCode || '',
                        CaseSummaryTooltip: caseTooltip,
                        Cases: acc.Cases || [],
                        isHovered: false
                    };
                });

                console.log(`✅ ${this.accounts.length} account(s) mapped.`);
                this.noResults = this.accounts.length === 0;
            })
            .catch(error => {
                console.error('❌ Error fetching accounts from Apex:', error);
                this.accounts = [];
                this.noResults = true;
            });
    }

    // Show tooltip on hover
    handleMouseEnter(event) {
        const hoveredId = event.currentTarget.dataset.id;
        this.hoveredAccountId = hoveredId;

        this.accounts = this.accounts.map(acc => ({
            ...acc,
            isHovered: acc.Id === hoveredId
        }));

        setTimeout(() => {
            const wrapper = this.template.querySelector(`div[data-id="${hoveredId}"]`);
            const tooltip = wrapper?.querySelector('.case-tooltip-extended');

            if (tooltip && wrapper) {
                tooltip.classList.remove('above', 'below');

                const wrapperRect = wrapper.getBoundingClientRect();
                const tooltipHeight = tooltip.offsetHeight;
                const buffer = 20;

                const spaceAbove = wrapperRect.top;
                const spaceBelow = window.innerHeight - wrapperRect.bottom;

                if (spaceAbove > tooltipHeight + buffer) {
                    tooltip.classList.add('above');
                } else {
                    tooltip.classList.add('below');
                }
            }
        }, 50);
    }

    handleMouseLeave() {
        this.hoveredAccountId = null;
        this.accounts = this.accounts.map(acc => ({
            ...acc,
            isHovered: false
        }));
    }

    // Open the modal woonstadCustomerOverview
    handleAccountClick(event) {
        const accountId = event.currentTarget.dataset.id;
        console.log('➡️ Dispatching showoverview event for AccountId:', accountId);
        if (accountId) {
            this.dispatchEvent(new CustomEvent('showoverview', {
                detail: { accountId }
            }));
        }
        this.closeModal();
    }

    // Close modal or go back
    goBack() {
        this.closeModal();
    }

    createCustomer() {
        this.closeModal();
        this.dispatchEvent(new CustomEvent('createnew'));
    }

    // Utility to close modal
    closeModal() {
        console.log('❎ Closing search modal');
        this.dispatchEvent(new CustomEvent('close'));
        const backdrops = document.querySelectorAll('.slds-backdrop.slds-backdrop_open');
        if (backdrops.length > 1) {
            backdrops[backdrops.length - 1].remove();
        }
    }
}