public with sharing class WoonstadCustomerOverviewController {
    @AuraEnabled(cacheable=true)
    public static WoonstadCustomerOverviewData getCustomerOverview(Id accountId) {
        WoonstadCustomerOverviewData data = new WoonstadCustomerOverviewData();

        // ✅ Get Account
        data.account = [
            SELECT Id, Name, FirstName, MiddleName, LastName, PersonBirthdate, Phone, PersonMobilePhone
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];

        // ✅ Get related Cases
        data.cases = [
            SELECT Id, CaseNumber, Subject, Description, Status, CreatedDate, Case_Reason__c,
                   Request__r.Request_Status__c, Wocas_Subject_Number__c
            FROM Case
            WHERE AccountId = :accountId
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];

        // ✅ Get related Bank Accounts
        data.bankAccounts = [
            SELECT Id, Name, IBAN__c, CreatedDate
            FROM Bank_Account__c
            WHERE Account__c = :accountId
        ];

        // ✅ Get related Addresses through Account_Address__c
        List<Account_Address__c> addressLinks = [
            SELECT Id, Account__c, Address__c,
                Address__r.Name, Address__r.Postal_Code__c,
                Address__r.City__c, Address__r.Full_Street_Name__c,
                Is_Primary__c, Active__c
            FROM Account_Address__c
            WHERE Account__c = :accountId
        ];
        data.addresses = addressLinks;

        // ✅ Extract primary & active address
        for (Account_Address__c link : addressLinks) {
            if (link.Is_Primary__c && link.Active__c && link.Address__r != null) {
                data.PrimaryStreet = link.Address__r.Full_Street_Name__c;
                data.PrimaryPostalCode = link.Address__r.Postal_Code__c;
                break;
            }
        }

        // ✅ Extract masked IBAN (last 4 digits)
        if (!data.bankAccounts.isEmpty()) {
            String iban = data.bankAccounts[0].IBAN__c;
            if (iban != null && iban.length() >= 4) {
                data.IBAN_Last4 = iban.right(4);
            }
        }

        return data;
    }

    // ✅ ViewModel for the LWC
    public class WoonstadCustomerOverviewData {
        @AuraEnabled public Account account;
        @AuraEnabled public List<Case> cases;
        @AuraEnabled public List<Bank_Account__c> bankAccounts;
        @AuraEnabled public List<Account_Address__c> addresses;

        // ✅ Flattened fields for LWC
        @AuraEnabled public String IBAN_Last4;
        @AuraEnabled public String PrimaryStreet;
        @AuraEnabled public String PrimaryPostalCode;
    }
}