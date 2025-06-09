Feature: Login Page features

  Background:
    Given I am on the home page
    When I click on the 'User Icon' button
    And I click on the 'Sign In' button
    Then I should be navigated to the Login page

  Scenario Outline: Verify Email field validation
    Then I should see the Email field
    When I enter <invalid_email_address> in the Email field
    And I click on the Continue button
    Then I should see the Email validation message

    Examples: Invalid Email Address formats
      | invalid_email_address |
      | "testuser"            |
      | "testuser@testing"    |
      | "testing.com"         |
      | "abc@testing"         |
      | "abc@testing."        |
      | "@testing.com"        |
