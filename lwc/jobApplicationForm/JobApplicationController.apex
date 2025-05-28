public with sharing class JobApplicationController {

    @AuraEnabled(cacheable=true)
    public static List<String> getJobPositions() {
        List<String> jobPositions = new List<String>();
        
        Schema.DescribeFieldResult fieldResult = Job_Application__c.Job_Position__c.getDescribe();
        for (Schema.PicklistEntry pickVal : fieldResult.getPicklistValues()) {
            jobPositions.add(pickVal.getValue()); // Fetch picklist values from Object
        }

        return jobPositions;
    }

    @AuraEnabled
    public static void saveJobApplication(Map<String, String> applicationData) {
        try {
            // 🟢 Validate Required Fields
            if (applicationData.get('fullName') == null || applicationData.get('email') == null ||
                applicationData.get('phoneNumber') == null || applicationData.get('jobPosition') == null ||
                applicationData.get('availableStartDate') == null) {
                throw new AuraHandledException('Missing required fields!');
            }

            // 🟢 Create Job Application Record
            Job_Application__c jobApp = new Job_Application__c();
            jobApp.Full_Name__c = applicationData.get('fullName');
            jobApp.Email__c = applicationData.get('email');
            jobApp.Phone_Number__c = applicationData.get('phoneNumber');
            jobApp.Job_Position__c = applicationData.get('jobPosition');
            jobApp.Available_Start_Date__c = Date.valueOf(applicationData.get('availableStartDate'));

            insert jobApp;

            // 🟢 Link Resume File (if uploaded)
            if (applicationData.containsKey('resumeFileId') && String.isNotEmpty(applicationData.get('resumeFileId'))) {
                ContentDocumentLink cdl = new ContentDocumentLink();
                cdl.ContentDocumentId = applicationData.get('resumeFileId');
                cdl.LinkedEntityId = jobApp.Id;
                cdl.ShareType = 'V'; // Viewer access
                cdl.Visibility = 'AllUsers';
                insert cdl;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error saving Job Application: ' + e.getMessage());
        }
    }
}
