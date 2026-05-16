// Computes "how much of the brand foundation has the user filled in?"
// Used by the dashboard completion meter so people see progress, not a blank slate.

const STEPS = [
  { id: 'profile', label: 'Fill out profile', test: (s) => Boolean(s.profile?.name && (s.profile?.title || s.profile?.bio)) },
  { id: 'dna', label: 'Define brand DNA', test: (s) => Boolean(s.dna?.manifesto || s.dna?.purpose || s.dna?.beliefs?.length) },
  { id: 'icp', label: 'Add your first ICP', test: (s) => Array.isArray(s.icps) && s.icps.length > 0 },
  { id: 'story', label: 'Capture a story', test: (s) => Array.isArray(s.stories) && s.stories.length > 0 },
  { id: 'hook', label: 'Save a hook', test: (s) => Array.isArray(s.hooks) && s.hooks.length > 0 },
  { id: 'content', label: 'Write a post', test: (s) => Array.isArray(s.content) && s.content.length > 0 },
];

export function computeCompletion(state) {
  const done = STEPS.map((step) => ({ ...step, done: Boolean(step.test(state)) }));
  const count = done.filter((d) => d.done).length;
  return {
    steps: done,
    completed: count,
    total: STEPS.length,
    pct: Math.round((count / STEPS.length) * 100),
    nextStep: done.find((d) => !d.done) || null,
  };
}
