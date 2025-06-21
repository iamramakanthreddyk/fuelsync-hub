describe('Stations CRUD', () => {
  it('can login and manage stations', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('owner@demofuel.com');
    cy.get('input[name=password]').type('password123');
    cy.contains('Login').click();

    cy.url().should('include', '/stations');
    cy.contains('Stations');

    cy.contains('Add Station').click();
    cy.get('input[name=station_name]').type('Test Station');
    cy.contains('Save').click();
    cy.contains('Test Station');

    cy.contains('Edit').first().click();
    cy.get('input[name=station_name]').clear().type('Updated Station');
    cy.contains('Save').click();
    cy.contains('Updated Station');

    cy.contains('Delete').first().click();
    cy.contains('Updated Station').should('not.exist');
  });
});
