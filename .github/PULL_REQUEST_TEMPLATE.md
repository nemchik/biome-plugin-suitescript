## What and why

<!-- Link the issue this closes (`Closes #123`). -->

## Checklist

- [ ] `npm run format` is clean and `npm test` passes
- [ ] A new or changed rule has a source comment naming its tier, and `scripts/rule-sources.ts` is updated, then `npm run build` and `npm run readme` run and the result committed
- [ ] Generated files (`biome-manifest.json`, `configs/`, the README rules table) are regenerated, not edited by hand
- [ ] A verification result is reflected in the tracking issue #72 (tick its box), and the matching `docs/verification/results/` page exists
- [ ] Commit messages follow Conventional Commits
