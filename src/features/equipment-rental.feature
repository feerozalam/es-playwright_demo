Feature: Equipment Rental Page Validation

  @smoke
  Scenario: Verify Equipment Rental page heading
    Given I navigate to the Equipment Rental home page
    Then I should see the page heading "Equipment Rentals"
