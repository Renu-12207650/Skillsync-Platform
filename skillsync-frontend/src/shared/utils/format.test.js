import { describe, it, expect } from 'vitest';
import { initials, prettyStatus, formatDate, formatDateTime, timeAgo } from './format.js';

describe('format::initials', () => {
  it('extracts first letters of up to two words', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('Linus Benedict Torvalds')).toBe('LB');
    expect(initials('Cher')).toBe('C');
  });
  it('handles missing names', () => {
    expect(initials('')).toBe('?');
    expect(initials(undefined)).toBe('?');
  });
});

describe('format::prettyStatus', () => {
  it('Title-cases known statuses', () => {
    expect(prettyStatus('PENDING_APPROVAL')).toBe('Pending approval');
    expect(prettyStatus('ACTIVE')).toBe('Active');
  });
  it('returns empty string for nullish', () => {
    expect(prettyStatus(null)).toBe('');
    expect(prettyStatus(undefined)).toBe('');
  });
});

describe('format::formatDate / formatDateTime', () => {
  it('returns em dash for falsy', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });
  it('returns em dash for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
  it('formats real dates without throwing', () => {
    const out = formatDate('2025-09-12T10:30:00Z');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});

describe('format::timeAgo', () => {
  it('returns em dash for falsy', () => {
    expect(timeAgo(null)).toBe('—');
  });
  it('produces a relative string for real dates', () => {
    const past = new Date(Date.now() - 60_000);
    const out = timeAgo(past);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});
