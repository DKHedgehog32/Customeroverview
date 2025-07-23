import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LOGO from '@salesforce/resourceUrl/WSRLogo';
import getCustomerOverview from '@salesforce/apex/WoonstadCustomerOverviewController.getCustomerOverview';
import searchArticles from '@salesforce/apex/woonstadCaseModalKnowledgeController.searchArticles';

export default class WoonstadCaseModal extends LightningElement {
    @api account;
    @api addresses;
    @api bankAccounts;
    @api cases;

    logoUrl = LOGO;
    @track showFlowModal = false;

    @track knowledgeSearchTerm = '';
    @track knowledgeResults = [];
    @track searched = false;
    @track isSearching = false;
    hoveredArticleId = null;

    connectedCallback() {
        console.log('🏁 WoonstadCaseModal loaded');
        console.log('📌 Received account:', JSON.stringify(this.account));
        console.log('📌 Received addresses:', JSON.stringify(this.addresses));
        console.log('📌 Received bankAccounts:', JSON.stringify(this.bankAccounts));
        console.log('📌 Received cases:', JSON.stringify(this.cases));
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleNewCase() {
        console.log('🟢 handleNewCase called');
        console.log('📇 Account ID to pass into flow:', this.account?.Id);
        this.showFlowModal = true;
    }

    closeFlowModal() {
        console.log('🔴 Flow modal closed manually');
        this.showFlowModal = false;
    }

    handleFlowStatusChange(event) {
        console.log('🔄 Flow status changed:', event.detail.status);
        if (event.detail.status === 'FINISHED') {
            console.log('✅ Flow finished, refreshing case data');
            this.showFlowModal = false;
            this.refreshCases();
        }
    }

    get flowInput() {
        const input = this.account?.Id
            ? [{ name: 'recordId', type: 'String', value: this.account.Id }]
            : [];
        console.log('📤 Flow input generated:', JSON.stringify(input));
        return input;
    }

    refreshCases() {
        getCustomerOverview({ accountId: this.account?.Id })
            .then(result => {
                this.cases = result.cases;
                this.addresses = result.addresses;
                this.bankAccounts = result.bankAccounts;
                console.log('♻️ Refreshed cases, addresses, and bankAccounts');
            })
            .catch(error => {
                console.error('❌ Error refreshing:', error);
            });
    }

    get customerData() {
        let ibanLast4 = '';
        let street = '';
        let postalCode = '';

        if (this.bankAccounts?.length > 0) {
            const iban = this.bankAccounts[0].IBAN__c || '';
            ibanLast4 = iban.slice(-4);
        }

        if (this.addresses?.length > 0) {
            const primaryAddress = this.addresses.find(addr => addr.Is_Primary__c && addr.Active__c);
            if (primaryAddress?.Address__r) {
                street = primaryAddress.Address__r.Full_Street_Name__c || '';
                postalCode = primaryAddress.Address__r.Postal_Code__c || '';
            }
        }

        return {
            IBAN_Last4: ibanLast4,
            PrimaryStreet: street,
            PrimaryPostalCode: postalCode
        };
    }

    handleSearchTermChange(event) {
        this.knowledgeSearchTerm = event.target.value;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleSearchClick();
        }
    }

    handleSearchClick() {
        if (this.knowledgeSearchTerm.length < 3) {
            this.showToast('Zoekterm te kort', 'Voer minimaal 3 tekens in.', 'warning');
            return;
        }

        this.searched = true;
        this.isSearching = true;
        this.knowledgeResults = [];

        searchArticles({ searchTerm: this.knowledgeSearchTerm })
            .then(result => {
                this.knowledgeResults = result.map(article => {
                    return {
                        ...article,
                        question: this.stripHtml(article.question),
                        answer: this.stripHtml(article.answer),
                        instruction: this.stripHtml(article.instruction),
                        isHovered: false
                    };
                });

                if (result.length === 0) {
                    this.showToast('Geen resultaten gevonden', 'Er zijn geen kennisartikelen gevonden.', 'warning');
                } else {
                    console.log(`🔍 ${result.length} articles found`);
                }
            })
            .catch(error => {
                console.error('❌ Error searching:', error);
                this.showToast('Fout', 'Fout bij het zoeken naar kennisartikelen.', 'error');
            })
            .finally(() => {
                this.isSearching = false;
            });
    }

    stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html || '';
        return tmp.textContent || tmp.innerText || '';
    }

    handleTooltipEnter(event) {
        const index = event.currentTarget.dataset.index;
        this.hoveredArticleId = this.knowledgeResults[index]?.knowledgeArticleId;

        console.log('🟦 Hover entered index:', index);
        console.log('🟦 Hovered articleId:', this.hoveredArticleId);

        this.knowledgeResults = this.knowledgeResults.map((article, i) => ({
            ...article,
            isHovered: article.knowledgeArticleId === this.hoveredArticleId
        }));
    }

    handleTooltipLeave() {
        console.log('🟥 Hover left, clearing hoveredArticleId');
        this.hoveredArticleId = null;

        this.knowledgeResults = this.knowledgeResults.map(article => ({
            ...article,
            isHovered: false
        }));
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}