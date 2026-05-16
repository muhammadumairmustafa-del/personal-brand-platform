import { describe, it, expect } from 'vitest';
import { validate, emailSchema, urlSchema, profileSchema, subscriberSchema } from '../lib/validators';

describe('emailSchema', () => {
  it('accepts a valid email', () => {
    expect(validate(emailSchema, 'a@b.co').ok).toBe(true);
  });
  it('rejects garbage', () => {
    expect(validate(emailSchema, 'nope').ok).toBe(false);
  });
  it('trims whitespace', () => {
    expect(validate(emailSchema, '  a@b.co  ').data).toBe('a@b.co');
  });
});

describe('urlSchema', () => {
  it('accepts https', () => {
    expect(validate(urlSchema, 'https://example.com').ok).toBe(true);
  });
  it('rejects naked domain', () => {
    expect(validate(urlSchema, 'example.com').ok).toBe(false);
  });
});

describe('profileSchema', () => {
  it('requires name', () => {
    const r = validate(profileSchema, { name: '', title: 'CEO' });
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBeTruthy();
  });
  it('accepts minimal valid profile', () => {
    const r = validate(profileSchema, { name: 'Ada' });
    expect(r.ok).toBe(true);
  });
});

describe('subscriberSchema', () => {
  it('requires email', () => {
    const r = validate(subscriberSchema, { name: 'Ada' });
    expect(r.ok).toBe(false);
  });
});
