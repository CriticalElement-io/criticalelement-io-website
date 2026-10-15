@AGENTS.md

## Claude Code specifics

- **Preview the site with the browser pane**, not a Bash server: `.claude/launch.json` defines a `site` configuration (`python3 -m http.server 8766`). Use `preview_start` with name `site`, then drive it with the browser tools. Test at desktop and the mobile preset before every push.
- **Testing the forms locally:** run `python3 docs/mock-endpoint.py` in the background and set the form's `data-endpoint` to `http://localhost:8767/ok` (or `/fail`) from the browser console. Never submit test data to the live endpoints without labeling it as a test so it can be deleted.
- **Mockups for review:** publish an Artifact when a non-technical reviewer needs a link. Inline `tokens.css`, `site.css` and the scripts, and blank the form `data-endpoint` so reviewers can't create rows.
- **Workflow with the team:** mock up and test locally, show the result, then push on an explicit go. Open PRs ready for review, not drafts. After merge, verify the live site with a cache-busting query string and report what you checked.
- Project history, decisions and account ownership are in `docs/handoff.md`. Read it before proposing structural changes.
