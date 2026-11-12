import "cypress-real-events/support";
import dotenv from 'dotenv';
dotenv.config();

const timestamp = Date.now();
const client_name = `Test-User_${timestamp}`;
const client_email = `test-user_${timestamp}@gmail.com`;
const client_password = "12345678";

describe('Blog App Client Tests', () => {
  before(() => {
    cy.visit('/');
    cy.contains('Signup').click();
    cy.get('input[name="name"]').type(client_name);
    cy.get('input[name="email"]').type(client_email);
    cy.get('input[name="password"]').type(client_password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.contains('Logout').should('be.visible');
  });

  beforeEach(() => {
    cy.session('loginSession', () => {
      cy.visit('/');
      cy.contains('Login').click();
      cy.get('input[name="email"]').type(client_email);
      cy.get('input[name="password"]').type(client_password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/');
      cy.contains('Logout').should('be.visible');
    });
  });

  it('Should display Blog App in navbar', () => {
    cy.visit('/');
    cy.get('nav').contains('Blog App').should('be.visible');
  });

  it('Should have Home, Login, and Signup buttons in Navbar (logged out)', () => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('nav').contains('Home').should('be.visible');
    cy.get('nav').contains('Login').should('be.visible');
    cy.get('nav').contains('Signup').should('be.visible');
  });

  it('Should show Explore Posts section', () => {
    cy.visit('/');
    cy.contains('Explore Posts').should('be.visible');
  });

  it('Should allow typing in search and filter inputs', () => {
    cy.visit('/');
    cy.get('input[placeholder="Search by keyword..."]').type('React').should('have.value', 'React');
    cy.get('input[placeholder="Filter by tags (comma-separated)"]').type('client').should('have.value', 'client');
  });

  it('Should show Google login/signup options', () => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Signup').click();
    cy.contains('Sign Up with Google').should('be.visible');

    cy.visit('/');
    cy.contains('Login').click();
    cy.contains('Login with Google').should('be.visible');
  });

  it('User should see their profile', () => {
    cy.visit('/');
    cy.contains('Profile').click();
    cy.contains(client_email).should('be.visible');
    cy.contains(client_name).should('be.visible');
    cy.contains("Total Posts: 0").should('be.visible');
  });

  it('User should access dashboard', () => {
    cy.visit('/');
    cy.contains('Dashboard').click();
    cy.contains('My Posts').should('be.visible');
    cy.contains('+ Create Post').should('be.visible');
  });

  it('User should create a post', () => {
    cy.visit('/');
    cy.contains('Dashboard').click();
    cy.contains('+ Create Post').click();
    cy.get('input[name="title"]').type("Test Post");
    cy.get('textarea[name="content"]').type("This is a test post content.");
    cy.get('input[name="tags"]').type("test, cypress");
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/create');
  });

  it('User should view their post in dashboard', () => {
    cy.visit('/');
    cy.contains('Dashboard').click();
    cy.contains("Test Post").should("be.visible");
    cy.contains("View").should("be.visible");
    cy.contains("Edit").should("be.visible");
    cy.contains("Delete").should("be.visible");
  });

});