/// <reference types="cypress" />

describe('Main User Flow', () => {
  it('allows a user to sign up, update profile, generate a plan, and make a post', () => {
    const user = {
      name: 'Cypress Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    };

    // 1. Sign Up
    cy.visit('/auth/signup');
    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();

    // 2. Land on Dashboard and go to profile
    cy.url().should('include', '/dashboard');
    cy.contains(`Welcome, ${user.name}!`);

    // Use the dropdown menu to navigate
    cy.get('header').contains(user.name).click();
    cy.get('a[href="/dashboard/profile"]').click();
    
    // 3. Update Profile
    cy.url().should('include', '/dashboard/profile');
    cy.get('input[name="height"]').clear().type('175');
    cy.get('input[name="weight"]').clear().type('70');
    cy.get('select[name="goal"]').select('Lose Weight');
    cy.contains('button', 'Save Changes').click();
    cy.contains('Profile updated successfully!');

    // 4. Go back to Dashboard and Generate Plan
    cy.get('a[href="/dashboard"]').first().click(); // Navigate back via header link
    cy.url().should('include', '/dashboard');
    cy.contains('button', 'Generate My Plan').click();

    // Wait for plan generation (this can take time)
    cy.contains('AI is crafting your plan...', { timeout: 30000 }).should('be.visible');
    cy.contains('Day 1', { timeout: 60000 }).should('be.visible'); // Wait for plan to display

    // 5. Go to Feed and create a post
    cy.get('header').contains(user.name).click();
    cy.get('a[href="/feed"]').click();
    cy.url().should('include', '/feed');

    const postContent = 'Just generated my first FormaAI plan! Feeling motivated!';
    cy.get('textarea[placeholder="What\\\'s on your mind?"]').type(postContent);
    cy.contains('button', 'Post').click();

    // Assert post is visible
    cy.contains(postContent).should('be.visible');
  });
});
