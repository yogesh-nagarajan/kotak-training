I'll verify how this project resolves component definitions before finalizing the plan. Let me check the config.# Make supermoney Blocks Appear in Universal Editor (via `main`)

## Why the blocks aren't showing

Universal Editor is an **xwalk** binding. The block palette and the "what can I insert here" rules come from **aggregated component JSON** (`component-definition.json`, `component-models.json`, `component-filters.json`) served from the **branch UE is bound to**.

Two independent conditions must both be true for a block to appear:

1. **Definition exists** — the block is aggregated into `component-definition.json` / `component-models.json`. ✅ Already true for `supermoney-hero`, `supermoney-header`, `supermoney-footer`, `accordion-faq`.
2. **Block is allowed in a container** — it's listed in the `section` filter in `component-filters.json`. ✅ Fixed in commit `7a941dd` (added the four blocks to `models/_section.json` → regenerated).

**The actual gap:** those commits live on this environment's local `main` (and the `811-super-money-credit-card` branch), but they are **not on GitHub's `main`** yet. UE reads the deployed `main`, so until the block definitions **and** the updated `section` filter are pushed to `origin/main` and Code Sync rebuilds, UE keeps showing only the old section-defined blocks.

**Confirmed answer to your question:** yes — if the blocks only exist on a different branch, UE (bound to `main`) will only show the blocks defined in `main`'s deployed `component-*.json`. The fix is to get the definitions **and** the section-filter change onto `main` on GitHub.

## Decisions locked in
- **Target branch:** merge everything into **`main`** (UE's default binding).
- **Push method:** **retry the push from this session** after the GitHub permissions toggle is enabled.

## Preconditions / open risk
- Push from this environment has failed repeatedly (`could not read Username`) — no credential reached the session. This plan's push step depends on the **GitHub permissions toggle being enabled** so injection actually works this time. If it still fails, fallback is pushing from your authenticated terminal against this working copy.
- Local `main` is ahead of `origin/main`, and `origin/main` has **diverged** (remote `main` = `c339bfb`, local `main` = a later commit). A plain push may be rejected (non-fast-forward) and require reconciling with the remote first.

## Checklist

- [ ] Confirm the current local `main` HEAD includes commit `7a941dd` (section-filter fix) and all block commits
- [ ] Verify all four blocks are in `component-definition.json`, `component-models.json`, and the `section` entry of `component-filters.json` on local `main`
- [ ] Fetch `origin` and compare local `main` vs `origin/main`; determine if the push is fast-forward or divergent
- [ ] If divergent: decide reconciliation (rebase/merge `origin/main` into local `main`) and resolve any conflicts in `component-*.json` / `models/`
- [ ] Ensure the GitHub permissions toggle is enabled (user action), then **retry `git push origin main`** from this session
- [ ] Confirm the push landed: `git ls-remote --heads origin main` shows the new HEAD
- [ ] Verify `component-filters.json` on the deployed branch contains the four blocks (read the preview URL's served file)
- [ ] Wait for AEM Code Sync to process `main`; check `gh`/preview build status
- [ ] Reload Universal Editor on a `/content/kotak-training/...` page and confirm **Supermoney Hero / Header / Footer** and **Accordion Faq** appear in a section's insert (+) menu
- [ ] (If UE still empty) Confirm which branch/config UE is actually bound to and that its served `component-*.json` is the updated one
- [ ] Sync `811-super-money-credit-card` with `main` (optional) so both branches carry the fix

## Notes
- No code changes remain for the fix itself — the block definitions and section filter are already correct locally (`7a941dd`). This plan is about **delivery**: getting `main` to GitHub and confirming UE reflects it.
- Execution of the push/verify steps requires **Execute mode** (this plan was drafted in Plan mode).
