# AGENTS.md

Guidance for coding agents (and humans) working on UniLend.

## Read this first

- **This repo holds v1 and v2 only** (static HTML/CSS/JS, `localStorage` state). The version used for user testing, **v3**, is a React + Firebase + Cloud Functions app deployed on Google Cloud Run (unilend.henishp.com). Its source is **not** in this repo yet.
- The pending work is specified in [`docs/improvements/IMPLEMENTATION_SPEC.md`](docs/improvements/IMPLEMENTATION_SPEC.md). Every task there targets **v3**. Do not apply those tasks to v1/v2 unless a task says so.
- The reasons behind each task are in [`docs/improvements/PLAN.md`](docs/improvements/PLAN.md). UI/UX proposals for after testing (not before) are in [`docs/improvements/UX_PROPOSALS.md`](docs/improvements/UX_PROPOSALS.md). The participant-facing materials are in [`docs/improvements/TESTING_MATERIALS.md`](docs/improvements/TESTING_MATERIALS.md).

## How to work on a spec task

1. Find the code by searching for the **search strings** the task lists (UI copy, route paths, field names). File paths in v3 are unknown at the time of writing.
2. Change only what the task names. Keep the existing visual style and components.
3. Meet every **acceptance criterion**. Run the **check steps** on a phone-sized viewport (375x812).
4. Do not touch security rules, auth or the Cloud Functions hand-off check unless the task says so. The server must still verify every hand-off code.
5. Run the existing automated tests (security-rule, browser and server suites) and keep them passing. Add a test for each behaviour change where a suite exists.
6. One task per commit, with the task ID in the message, e.g. `A1: show hand-off code only after "I'm at the pickup spot"`.

## Things never to do

- Never commit real credentials, test-account passwords, service-account keys or `.env` files. This repo is public.
- Never put participant data (names, notes, recordings, CSV exports) in this repo.
- Never deploy. A team member redeploys to Cloud Run after review.
