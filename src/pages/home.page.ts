import { BasePage } from './base.page';

/**
 * sub page containing specific selectors and methods for a specific page
 */
export class HomePage extends BasePage {

    private rentEquipmentBtn = '.home-hero-rent-btn'
    private exploreT3Btn = '.home-hero-t3-btn'
    private userIconBtn = '#esr-user-dropdown-menu button'
    private signInBtn = "(//button[text()='Sign In'])[1]"


    public get getRentEquipmentButton() {
        return this.page.locator(this.rentEquipmentBtn);
    }

    public get getExploreT3Button() {
        return this.page.locator(this.exploreT3Btn);
    }

    public get getUserIconButton() {
        return this.page.locator(this.userIconBtn);
    }

    public get getSignInButton() {
        return this.page.locator(this.signInBtn)
    }

    public open() {
        return super.navigate('/');
    }

}

