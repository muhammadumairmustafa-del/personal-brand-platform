# PersonalBrandPlatform decomposition notes

`components/PersonalBrandPlatform.jsx` is ~10k lines containing 25 view components plus shared atoms, hooks, and helpers. A full split would be high-risk in one pass — here's the migration pattern to follow as features land.

## Already extracted

- `hooks/useEscape.js`
- `hooks/useBodyScrollLock.js`
- `hooks/useDocTitle.js`
- `hooks/useAiUsage.js`
- `components/ViewErrorBoundary.jsx`
- `components/SaveStatus.jsx`
- `components/OnboardingMeter.jsx`
- `components/ExportButton.jsx`
- `components/VersionHistoryDropdown.jsx`
- `components/UploadDropzone.jsx`
- `components/LoadMoreFooter.jsx`
- `components/PostPerformanceLogger.jsx`
- `components/FieldHint.jsx`

## Migration pattern

For each view (Dashboard, StoryVault, ContentEngine, etc.):

1. Identify the view's external deps: state setters passed in as props, shared atoms (`Pill`, `Field`, `Input`, `ChipInput`, `SectionHeader`, `EmptyState`), and external helpers (`safeAIParse`, `firstNameOf`).
2. Create `views/<viewName>.jsx`. Copy the function and its inner helpers (`StoryCard`, `StoryRow`) into it.
3. Import the shared atoms from `components/ui/` (extract those first if not yet done).
4. Replace the view's inline definition in `PersonalBrandPlatform.jsx` with an import.
5. Verify the view loads end-to-end before moving on.

## Shared atoms still inline (next to extract)

These are used across many views and should land in `components/ui/atoms.jsx`:

- `SectionHeader`
- `EmptyState`
- `Field`, `Input`, `Textarea`, `ChipInput`
- `Pill`
- `RestoreProfileSnapshot`
- `DeleteAccountSection`
- `CommandPalette`
- `BookmarkletModal`

Once these are out, each view becomes a clean self-contained module.
