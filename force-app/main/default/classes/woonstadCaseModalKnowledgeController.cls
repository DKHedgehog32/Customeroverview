public with sharing class woonstadCaseModalKnowledgeController {
    
    @AuraEnabled(cacheable=true)
    public static List<KnowledgeWrapper> searchArticles(String searchTerm) {
        List<KnowledgeWrapper> results = new List<KnowledgeWrapper>();
        
        if (String.isBlank(searchTerm)) return results;

        // Use filterable field Title for initial query
        List<Knowledge__kav> articles = [
            SELECT KnowledgeArticleId, Title, Question__c, Answer__c, Work_Instruction__c
            FROM Knowledge__kav
            WHERE PublishStatus = 'Online'
            AND Language = 'nl_NL'
            AND Title LIKE :('%' + searchTerm + '%')
            ORDER BY LastPublishedDate DESC
            LIMIT 50
        ];

        String lower = searchTerm.toLowerCase();

        for (Knowledge__kav article : articles) {
            if (
                (article.Question__c != null && article.Question__c.toLowerCase().contains(lower)) ||
                (article.Answer__c != null && article.Answer__c.toLowerCase().contains(lower)) ||
                (article.Work_Instruction__c != null && article.Work_Instruction__c.toLowerCase().contains(lower)) ||
                (article.Title != null && article.Title.toLowerCase().contains(lower))
            ) {
                results.add(new KnowledgeWrapper(article));
            }
        }

        return results;
    }

    public class KnowledgeWrapper {
        @AuraEnabled public String knowledgeArticleId;
        @AuraEnabled public String title;
        @AuraEnabled public String question;
        @AuraEnabled public String answer;
        @AuraEnabled public String instruction;

        public KnowledgeWrapper(Knowledge__kav article) {
            this.knowledgeArticleId = article.KnowledgeArticleId;
            this.title = article.Title;
            this.question = article.Question__c;
            this.answer = article.Answer__c;
            this.instruction = article.Work_Instruction__c;
        }
    }
}