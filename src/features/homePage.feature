Feature: Home page UI

  Background:
    Given I am on the home page

  Scenario: Verify the buttons present on the home page
    Then I should see the 'Rent Equipment' button in the home page
    Then I should see the 'Explore T3' button in the home page

  Scenario: Verify that the Sign In button is available under the User icon button
    When I click on the 'User Icon' button
    Then I should see the 'Sign In' button in the home page

  Scenario: Verify that the user is able to navigate to the Login page
    When I click on the 'User Icon' button
    And I click on the 'Sign In' button
    Then I should be navigated to the Login page
