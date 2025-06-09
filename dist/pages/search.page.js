"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchPage = void 0;
const base_page_1 = require("./base.page");
class SearchPage extends base_page_1.BasePage {
    constructor() {
        super(...arguments);
        this.searchInput = '#search-input';
        this.searchButton = '#search-button';
        this.searchResults = '.search-results';
    }
    async performSearch(searchTerm) {
        await this.type(this.searchInput, searchTerm);
        await this.click(this.searchButton);
    }
    async hasSearchResults() {
        await this.waitForElement(this.searchResults);
        return true;
    }
}
exports.SearchPage = SearchPage;
