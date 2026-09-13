import { describe, expect, it } from 'vitest';
import { formatDate, requestReference, statusLabel, statusTone, typeLabel } from './format';

describe('display formatting', () => {
  it('labels every request status', () => {
    expect(statusLabel('PENDING_PAYMENT')).toBe('Pending payment');
    expect(statusLabel('AT_LAB')).toBe('At lab');
    expect(statusLabel('COMPLETE')).toBe('Complete');
  });

  it('maps statuses to badge tones', () => {
    expect(statusTone('COMPLETE')).toBe('success');
    expect(statusTone('REJECTED')).toBe('danger');
    expect(statusTone('PENDING_PAYMENT')).toBe('warning');
  });

  it('labels request types', () => {
    expect(typeLabel('FITNESS_CERTIFICATE')).toBe('Fitness certificate');
    expect(typeLabel('CHECKUP')).toBe('Checkup');
  });

  it('formats dates the way the prototype screens did', () => {
    expect(formatDate('2026-09-12T08:00:00.000Z')).toBe('12 Sep 2026');
  });

  it('renders an em dash for a missing or invalid date', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('derives a stable, human-quotable reference', () => {
    const ref = requestReference('8e386bd6-7842-4829-8b41-68cd194a413d', '2026-09-13T18:00:00.000Z');
    expect(ref).toBe('RQ-2026-8E386B');
    expect(requestReference('8e386bd6-7842-4829-8b41-68cd194a413d', '2026-09-13T18:00:00.000Z')).toBe(ref);
  });
});
