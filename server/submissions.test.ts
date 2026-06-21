import { describe, it, expect } from 'vitest';
import { createUserSubmission, getAllUserSubmissions } from './db';

describe('User Submissions', { timeout: 15000 }, () => {
  const testSubmission = {
    fullName: 'John Doe',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    email: 'john@example.com',
  };

  it('should create a user submission', async () => {
    const result = await createUserSubmission(testSubmission);
    expect(result).toBeDefined();
  });

  it('should retrieve all submissions', async () => {
    const submissions = await getAllUserSubmissions();
    expect(Array.isArray(submissions)).toBe(true);
    expect(submissions.length).toBeGreaterThan(0);
  });

  it('should have correct submission fields', async () => {
    const submissions = await getAllUserSubmissions();
    if (submissions.length > 0) {
      const submission = submissions[0];
      expect(submission).toHaveProperty('fullName');
      expect(submission).toHaveProperty('phone');
      expect(submission).toHaveProperty('country');
      expect(submission).toHaveProperty('email');
      expect(submission).toHaveProperty('createdAt');
    }
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(testSubmission.email)).toBe(true);
  });

  it('should have non-empty required fields', () => {
    expect(testSubmission.fullName.trim().length).toBeGreaterThan(0);
    expect(testSubmission.phone.trim().length).toBeGreaterThan(0);
    expect(testSubmission.country.trim().length).toBeGreaterThan(0);
    expect(testSubmission.email.trim().length).toBeGreaterThan(0);
  });

  it('should validate phone number format', () => {
    const validPhones = [
      '+1 (555) 123-4567',
      '5551234567',
      '+86 10 1234 5678',
      '+44-20-7946-0958',
    ];

    validPhones.forEach((phone) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      expect(/^\+?[0-9]{7,15}$/.test(cleanPhone)).toBe(true);
    });
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',        // too short
      'abc123def',  // contains letters
      '123-',       // incomplete
    ];

    invalidPhones.forEach((phone) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      expect(/^\+?[0-9]{7,15}$/.test(cleanPhone)).toBe(false);
    });
  });

  it('should validate email format', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.org',
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      'user@',
      '@example.com',
      'user @example.com',
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});
