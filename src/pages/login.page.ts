import {BasePage} from './base.page';

export class LoginPage extends BasePage {

    private welcomeHeading = 'h1:has-text("Welcome")'
    private emailAddress = '#userIdentifier'
    private emailErrorMessage = '#error-userIdentifier';
    private forgotPassword = 'Forgot password?'
    private password = '#password'
    private passwordErrorMessage = '#error-password'
    private continueButton = 'button:has-text("Continue")'

    public get getWelcomeHeading() {
        return this.page.locator(this.welcomeHeading)
    }

    public get getEmailAddress() {
        return this.page.locator(this.emailAddress)
    }

    public get getEmailErrorMessage() {
        return this.page.locator(this.emailErrorMessage)
    }

    public get getForgotPasswordLink() {
        return this.page.locator(this.forgotPassword)
    }

    public get getPassword() {
        return this.page.locator(this.password)
    }

    public get getPasswordErrorMessage() {
        return this.page.locator(this.passwordErrorMessage)
    }

    public get getContinueButton() {
        return this.page.locator(this.continueButton)
    }

}
