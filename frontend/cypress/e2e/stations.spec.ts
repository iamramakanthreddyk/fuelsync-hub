describe('Stations CRUD', () => {
  it('loads stations list', () => {
    cy.visit('/stations');
    cy.contains('Stations');
  });
});
