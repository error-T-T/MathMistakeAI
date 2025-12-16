# Project Log - MathMistakeAI

This `project_log.md` is created to follow the long-running agent workflow described in the project prompts.

Usage guidance

- Every session should add one entry here with:
  - Date / session id
  - Short description of the work completed
  - Files changed / commits made
  - Next steps and blockers

Session template

```
## Session [YYYY-MM-DD HH:MM]
- Owner: GitHub Copilot (taking over from full-permission agent)
- Completed: <short list of completed items>
- Files changed: <paths>
- Commits: <git commit hashes>
- Blockers: <if any>
- Next steps: <one-sentence next task>
```

Recommended workflow for each session

1. Run `./agent_runner.sh` (or `bash agent_runner.sh`) to gather environment context.
2. Pick a single feature from `features.json` with `passes: false` (highest priority first).
3. Implement only that feature and add tests or a verification plan.
4. Update `features.json` (`passes` -> `true`) only after end-to-end verification.
5. Commit changes with a descriptive message and append a session entry to this `project_log.md` and `claude-progress.txt`.

Notes

- Maintainer contact: Rookie (error-T-T) ¡ª RookieT@e.gzhu.edu.cn
- This file is intended to be the primary, human-friendly session log. `claude-progress.txt` remains the automatic/detailed progress file used by the agent.
