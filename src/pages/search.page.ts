import { BasePage } from './base.page';

export class SearchPage extends BasePage {  private readonly searchInput = 'textarea[name="q"]';
  private readonly searchButton = 'input[name="btnK"]';
  private readonly searchResults = '#search';
  async performSearch(searchTerm: string) {
    await this.fill(this.searchInput, searchTerm);
    // Press Enter instead of clicking the search button as it's more reliable
    await this.page.keyboard.press('Enter');
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }
  async hasSearchResults() {
    try {
      await this.waitForElement(this.searchResults);
      const results = await this.page.$$(this.searchResults);
      return results.length > 0;
    } catch (error) {
      return false;
    }
  }
}
