import { LightningElement, track } from 'lwc';
import saveJobApplication from '@salesforce/apex/JobApplicationController.saveJobApplication';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';

export default class JobApplicationForm extends LightningElement {
    @track showSuccessMessage = false;
    @track showResumeSuccessMessage = false;
    @track fullName = '';
    @track email = '';
    @track phoneNumber = '';
    @track jobPosition = '';
    @track availableStartDate = '';
    @track resumeFileId = '';
    temporaryRecordId = Id;

    // Error state
    @track errors = {
        fullName: false,
        email: false,
        phoneNumber: false,
        jobPosition: false,
        availableStartDate: false,
        resumeFileId: false
    };

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
        this.errors[field] = false; // clear error on input
    }
handleUploadFinished(event) {
    const uploadedFiles = event.detail.files;
    if (uploadedFiles.length > 0) {
        this.resumeFileId = uploadedFiles[0].documentId;
        this.errors.resumeFileId = false;

        // ✅ Show toast for desktop
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Resume uploaded successfully!',
                variant: 'success'
            })
        );

        // ✅ Show inline success message for mobile
        this.showResumeSuccessMessage = true;

        // Optional: Hide it again after a few seconds
        setTimeout(() => {
            this.showResumeSuccessMessage = false;
        }, 1000);
    }
}


  handleSubmit() {
    this.validateFields();

    // If any error is true, don't proceed
    const hasErrors = Object.values(this.errors).some(error => error);
    if (hasErrors) return;

    const applicationData = {
        fullName: this.fullName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        jobPosition: this.jobPosition,
        availableStartDate: this.availableStartDate,
        resumeFileId: this.resumeFileId
    };

    saveJobApplication({ applicationData })
        .then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Job Application Submitted Successfully!',
                variant: 'success'
            }));

            this.showSuccessMessage = true;

            // ✅ Wait 1 seconds, then reload page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Apex Error:', error);
        });
}


    


    validateFields() {
        this.errors.fullName = !this.fullName;
        this.errors.email = !this.email;
        this.errors.phoneNumber = !this.phoneNumber;
        this.errors.jobPosition = !this.jobPosition;
        this.errors.availableStartDate = !this.availableStartDate;
        this.errors.resumeFileId = !this.resumeFileId;
        
    }

    resetForm() {
        this.fullName = '';
        this.email = '';
        this.phoneNumber = '';
        this.jobPosition = '';
        this.availableStartDate = '';
        this.resumeFileId = '';
        this.errors = {
            fullName: false,
            email: false,
            phoneNumber: false,
            jobPosition: false,
            availableStartDate: false,
            resumeFileId: false
        };
    }
}