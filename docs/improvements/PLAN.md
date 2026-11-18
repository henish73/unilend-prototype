# UniLend: improvement plan (before and after user testing)

Written 2026-11-17. This is the reasoning behind `IMPLEMENTATION_SPEC.md`. It is based on the course lectures (Lec 1-8), the P1 and P2 briefs, instructor feedback on P1 and P2 (paraphrased; scores left out), and a live run of the study tasks.

## 1. Summary

The prototype works end to end. The weak points are **method and justification**:

- **Hand-off code (data validity).** In T1 the code is visible before the meeting, so the task doesn't test the hand-off (spec A1). The P2 brief also requires participants to finish **without facilitator intervention**, so the fix must happen in the app, not with a team member showing a code.
- **Research chain.** The slides teach: evidence, then persona, then scenario, then storyboard, then requirement, then prototype, then test. UniLend went from idea to features. P3 must close this or state it as a limitation.
- **Test plan.** It needs labelled scales, frequency questions instead of yes/no, a think-aloud protocol, situation-style tasks, and 2-3 metrics per task with targets.

## 2. Feedback ledger (paraphrased)

| # | Source | Feedback | Status | Action |
|---|---|---|---|---|
| 1 | P1 | Points and rewards to the lender look like a transaction; nothing makes the borrower pass help on | Partly fixed (Pass-It-On step) | Log pledges separately (spec A4); in P3 explain why points are recognition, not payment |
| 2 | P1 | "Non-monetary" conflicts with vouchers and gift cards | Mostly fixed (recognition rewards only) | Remove or explain the "money rewards admin switch" in the report |
| 3 | P1 | Similar solutions exist (campus lending, Libraries of Things) | Open | Related-work paragraph in P3 (sources in section 7) |
| 4 | P1 | "Easy to prototype" is not a reason to choose a topic | Open | Base the rationale on user need (pre-test Q3 evidence) and the Pay It Forward theme |
| 5 | P1 | Videos and blogs are not scholarly; AI tool listed as a reference | Open | Peer-reviewed sources; AI-use appendix with prompts |
| 6 | P2 | Demographic quotas unnecessary at n=10 | Fix | Drop quotas; aim for a mix |
| 7 | P2 | Session length not justified | Fix | Use pilot timings |
| 8 | P2 | No item scales; avoid yes/no | Fix | Frequency items (TESTING_MATERIALS) |
| 9 | P2 | Scale endpoints not labelled | Fix | Label every scale; SEQ 1-7 per task |
| 10 | P2 | Use think-aloud | Fix | Script with a practice round |
| 11 | P2 | Write tasks as situations, like the A3 context cards | Fix | Task cards (TESTING_MATERIALS) |
| 12 | Announcement | Similar colour schemes and the word "chain" across groups; AI-led brainstorming | Shows in UniLend | Rename "help chain" (spec C3); explain design choices; disclose AI use |
| 13 | Announcement | Same metrics across groups; plans too broad | Fix | One research question per task, 2-3 metrics |
| 14 | Announcement | Final work must be a working interface | Met | Mention in P3 |

## 3. Lecture audit: what's missing

| Lecture | Requirement | Gap | Fix |
|---|---|---|---|
| 1 | Disclose AI use with prompts in an appendix | High | AI-use appendix in P3 |
| 1 | P3: ACM template, 8 sections; 5-slide talk with "Limitations and Regrets" | High | Section 6 |
| 1 | Iterative user-centred process | High | Test, change, retest after testing day |
| 3 | Understand users first (past behaviour, not opinions) | High | Use pre-test Q3 as needs evidence; state as a limitation |
| 3 | Labelled, symmetric scales; no hypothetical questions | High | TESTING_MATERIALS |
| 3 | Shneiderman's 8 Golden Rules | Medium | Frame findings with them (closure, error handling, user control, consistency) |
| 4 | Mental models; salient feedback | Medium | Think-aloud evidence; success states (spec A3) |
| 5 | Evidence-based personas; scenarios; storyboards; requirements written as needs | High | Proto-personas labelled; one 6-frame storyboard; 4-5 needs-based requirements |
| 6 | Prototype answers a stated question; fast, realistic responses | High | Research questions; typing indicator (spec C1) |
| 7 | Test plan with research question, success and stop rules; pilot; neutral moderation; report uncertainty; revise and retest | High | Sections 4-6 |
| 8 | Feedback, progress indicators, response under 1 s or a progress cue; mobile context | Medium | Spec A3, C1, C2 |
| 8/9 | Accessibility (contrast, labels) | Medium | Check after Lec 9 |

## 4. Live test findings (2026-11-17)

| Task | Time | Wrong codes | After the task |
|---|---|---|---|
| T1 Borrow | 215 s | 1 (deliberate) | - |
| T2 Return | 17 s | 0 | passed it on at 36 s |
| T3 Lend | 31 s | 0 | - (claim blocked by native dialog in the test browser) |

Findings, mapped to spec IDs: code visible before the meeting (A1, severity 4) · 100 starting points in T3 (A2, 3) · 3-minute cap too short (B2, 3) · pledge counted as passing it on (A4, 3) · no pickup confirmation (A3, 2) · "[403]" in error text (A3, 2) · native confirm on claim (C2, 2) · real-clock meet times (C4, 2) · seeded requests compete with tasks (B3, 2) · stale loans after Prepare (B5, 2) · auto-confirmed return (note in P3, 1) · inconsistent points and labels (B4, B6, 1) · "help chain" (C3, 1) · console text and outcomes out of date (B1, 1).

Worked well: per-participant reset, automatic timer stop, wrong-code counting, timestamped Pass-It-On logging, a clear Ask form.

## 5. Testing-day procedure

- **Devices:** facilitator laptop runs the console; participant phone runs the student app. Never the same browser, because sign-ins are shared.
- **30 minutes before:** pilot with one non-member; Prepare study data; turn on Study lock and Testing day mode; check for leftover loans.
- **Session (25 min):** consent (3), pre-test (2), think-aloud practice (1), tasks with SEQ and a screen-specific follow-up (10), post-test (5), save the note (2), reset (2).
- **Moderation:** only neutral prompts. Any hint means the task is "assisted"; write the hint word for word. Don't mention Pass-It-On. Log visual-only comments separately.
- **Failures:** if a simulated reply hasn't arrived after 30 s, press "Next step as Sam" and mark it a system stall. On a crash, switch to the spare phone and run setup again.

## 6. After testing and P3

**Analysis per task:**
- Unaided completion with an adjusted-Wald 95% interval: p = (x+2)/(n+4), ± 1.96 · sqrt(p(1-p)/(n+4)). For example, 8/10 gives roughly 48-95%.
- Median and range of time, successful attempts only.
- Errors per participant.
- SEQ median.
- Pass-It-On outcome counts.

**Qualitative:** affinity diagram, frequency and severity (0-4, rated independently and then agreed), said-vs-did comparison, and themes from pre-test Q3.

**Iterate:** fix the top 3-5 problems, then retest only the changed paths with 3 new people. Report before and after without claiming significance.

**P3 report (ACM):**
1. Introduction with related work
2. Motivation: feedback-driven changes, proto-personas, storyboard, needs-based requirements
3. System overview
4. Methodology
5. Results
6. Discussion: extrinsic points vs. paying it forward
7. Limitations
8. Future work
9. Appendix: AI use, consent, instruments

**P3 talk (5 slides):** intro and sketch · prototype and study design · findings · changes and retest · limitations and regrets.

## 7. Sources

- Baker, W. E., & Bulkley, N. (2014). Paying it forward vs. rewarding reputation: Mechanisms of generalized reciprocity. *Organization Science, 25*(5), 1493-1510. https://doi.org/10.1287/orsc.2014.0920
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin, 125*(6), 627-668. https://doi.org/10.1037/0033-2909.125.6.627
- Hamari, J., Sjöklint, M., & Ukkonen, A. (2016). The sharing economy: Why people participate in collaborative consumption. *JASIST, 67*(9), 2047-2059. https://doi.org/10.1002/asi.23552
- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". *MindTrek '11*, 9-15. https://doi.org/10.1145/2181037.2181040
- *Libraries of Things: Understanding the challenges of sharing tangible collections and the opportunities for HCI.* CHI 2023. https://doi.org/10.1145/3544548.3581094 (check the author list)
- *Sharing and repairing at university: On student practices, and the future of the circular campus.* Circular Economy and Sustainability, 2024. https://doi.org/10.1007/s43615-024-00403-4 (check the author list)
- Sauro, J., & Dumas, J. S. (2009). Comparison of three one-question, post-task usability questionnaires. *CHI '09*.
