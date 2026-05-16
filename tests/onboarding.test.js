import { describe, it, expect } from 'vitest';
import { computeCompletion } from '../lib/onboarding';

describe('computeCompletion', () => {
  it('returns 0% when state is empty', () => {
    const r = computeCompletion({});
    expect(r.completed).toBe(0);
    expect(r.pct).toBe(0);
    expect(r.nextStep.id).toBe('profile');
  });

  it('marks profile step done when name + title present', () => {
    const r = computeCompletion({ profile: { name: 'Ada', title: 'Founder' } });
    const profileStep = r.steps.find((s) => s.id === 'profile');
    expect(profileStep.done).toBe(true);
  });

  it('counts all six steps when fully populated', () => {
    const state = {
      profile: { name: 'Ada', title: 'CEO' },
      dna: { manifesto: 'Build relentlessly.' },
      icps: [{ name: 'SaaS founder' }],
      stories: [{ title: 'Origin' }],
      hooks: [{ text: 'A hook' }],
      content: [{ body: 'A post' }],
    };
    const r = computeCompletion(state);
    expect(r.completed).toBe(6);
    expect(r.pct).toBe(100);
    expect(r.nextStep).toBeNull();
  });

  it('returns the next incomplete step', () => {
    const state = {
      profile: { name: 'Ada', title: 'CEO' },
      dna: { manifesto: 'Yes.' },
      icps: [],
    };
    expect(computeCompletion(state).nextStep.id).toBe('icp');
  });
});
