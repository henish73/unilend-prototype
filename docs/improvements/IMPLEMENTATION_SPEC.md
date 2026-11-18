# UniLend v3: implementation spec (pre-testing fixes)

Status: open · Written 2026-11-17 from a live end-to-end run of the study tasks (T1-T3) on unilend.henishp.com, as participant S01 and as facilitator.
Target: **v3** (React + Firebase + Cloud Functions on Cloud Run). See `AGENTS.md` for working rules.

Priority: **P0** = must ship before testing day (it affects data validity) · **P1** = should ship · **P2** = nice to have.
Order of work: A1, A2, A3, A4, A5, then B1-B6, then C1-C4.

---

## A1 (P0): Don't show the hand-off code before the meeting

**Problem.** In T1 (borrow), the simulated lender's first chat message after the offer is accepted contains the 4-digit code (the message reads: *"Hi! Yes, you can borrow it. I'm at <spot>. When we meet, my screen shows the code 1412. Enter it in UniLend to confirm you've got it."*). The same message is shown again on the pickup page (`/student-dashboard/exchanges/<id>/scan`, title "Pick up the item"), directly above the code input. The borrower can confirm pickup without meeting anyone, so the task can't measure the hand-off. The message also appears as the Inbox preview.

**Search strings.** `my screen shows the code` · `Enter it in UniLend to confirm` · `Pick up the item` · `Confirm you have the item` · `Type the 4-digit code on` · `Confirm pickup`

**Required behaviour.**
1. The simulated lender's message must not contain the code. New copy: *"Great, I'm at <spot>. I'll show you a code on my phone when we meet."* Remove the duplicated "Hi! Yes, you can borrow it" line; the lender has already said yes earlier in the chat.
2. The pickup page must not quote any chat message.
3. The pickup page starts with one primary button: **"I'm at the pickup spot"**.
4. Tapping it reveals a card styled as the other person's phone: header *"<Lender name>'s screen"*, the 4-digit code in large type, and the caption *"Type this code below to confirm you have the item."* The code input and **Confirm pickup** button appear under the card.
5. This applies only to **simulated** lenders (study mode). For two real users, the code stays on the lender's device only, as now.
6. The server-side code check stays unchanged.
7. Do the same audit for the return flow: no message or page may show the code the other party must type, except the "phone card" pattern above.

**Acceptance criteria.**
- [ ] No chat message, Inbox preview, notification or page text contains the code before "I'm at the pickup spot" is tapped (search the rendered DOM for the 4 digits).
- [ ] After the tap, the code is visible on the phone card, and entering it completes pickup.
- [ ] A wrong code still counts as a wrong code in the facilitator timings table.
- [ ] The T1 timer still stops at pickup confirmation.

**Check.** Facilitator: Set up T1 for a spare account, start the timer. Participant: Ask, then chat, then Accept offer, then Confirm pickup. Search the page for the code before and after tapping.

---

## A2 (P0): T3 participants start at 0 points

**Problem.** "Set up" gives every participant 100 starting points (the console says *"Setting up clears this participant's earlier loans and items and gives them 100 starting points."*). In T3 the participant is asked to see what their help earned. With 100 points, 30+ rewards are claimable before they lend anything, so the task can't show whether lending leads to the reward.

**Search strings.** `100 starting points` · the study task setup function for `T3` / `Lend an item`

**Required behaviour.** T3 setup sets the balance to **0**. T1 and T2 keep their current value (document it). Update the console helper text to state the starting points per task.

**Acceptance criteria.**
- [ ] After "Set up T3", the participant's header badge and the Rewards page show 0 before lending, and the lend points after the hand-off (currently +40 for the calculator).
- [ ] At least one recognition reward is claimable with the points from one T3 lend.

---

## A3 (P0): Clear pickup confirmation and clean error text

**Problem.** (a) After the correct pickup code, the page silently changes to "Due <date>". Participants may not know they're done (Shneiderman rule 4: design dialogs to yield closure). (b) A wrong code shows *"That code doesn't match. Check the lender's screen and try again. [403]"*. The raw status code is shown to users.

**Search strings.** `That code doesn't match` · `[403]` · `Due ` on the exchange page

**Required behaviour.**
- After a successful pickup: a success state (banner or sheet) reading *"You've got the <item>. Return it by <time>."* with one button, **Done**.
- After a successful return (lender confirms): *"Returned. Thanks for bringing it back on time."* before the Pass-It-On page.
- Error copy without status codes: *"That code doesn't match. Check <name>'s screen and try again."*. Log the status code to the console only.

**Acceptance criteria.**
- [ ] No user-facing string contains a bracketed HTTP status.
- [ ] A success state is visible for at least 2 seconds, or until dismissed, after pickup and after return.

---

## A4 (P0): Log Pass-It-On choices separately

**Problem.** On the Pass-It-On page, **"I'll help the next person who asks"** gives 15 points and is recorded the same as passing it on (console shows *"passed it on at 36s"*). That inflates the main Pay It Forward metric with a promise.

**Search strings.** `I'll help the next person who asks` · `Answer someone's request` · `Lend something of mine` · `Not now` · `passed it on at` · `The help chain grew by one`

**Required behaviour.**
1. Record one outcome per T2 run: `lent` · `answered` · `pledged` · `declined` (Not now) · `not_seen` (left without choosing).
2. The facilitator timings table and CSV export show that outcome in the "After the task" column, e.g. `pledged at 36s`.
3. Remove the 15-point award for `pledged`, or award it only when the pledge is fulfilled (the next request answered).

**Acceptance criteria.**
- [ ] Each of the five outcomes appears correctly in the console and CSV when produced.
- [ ] Choosing the pledge no longer changes the points balance (unless fulfilled).

---

## A5 (P0): Verification run

After A1-A4 are deployed, run T1, T2 and T3 once on a spare account (e.g. S12) at 375x812 and confirm:
- [ ] Each task row appears in the timings table with Completed, time and wrong codes.
- [ ] CSV export contains the new Pass-It-On outcome column.
- [ ] No console errors on any task path.

---

## B1 (P1): Study console text and outcome options

- Replace the console's scenario text with the task cards in `TESTING_MATERIALS.md` (T1, T2, T3a, T3b).
- Observation note options must be exactly: `Completed unaided` · `Completed with hesitation` · `Assisted (hint given)` · `Not completed`.
- **Search strings:** `Get a charger from another student on campus` · `Completed without help` · `Needed a neutral prompt`

## B2 (P1): Time caps per task

- T1 cap 5 min, T2 and T3 3 min. If the console shows a cap or warning, use these values. Otherwise show elapsed time with a colour change at the cap.

## B3 (P1): Remove seeded requests and listings that compete with the tasks

- During study mode, hide or reword the request *"A phone charger, my battery is dying"* (competes with T1) and *"A TI-84 calculator for my stats quiz"* (competes with T3).
- Remove duplicate listings, e.g. "Samsung fast phone charger", "Casio scientific calculator", "Lab coat (size M)", "Intro to Algorithms (textbook)", "HDMI cable (2 m)", "Calculus study notes (printed)", "Umbrella", "Safety goggles", "Portable power bank" each appear 2x from different simulated owners.
- Remove stale requests older than 1 day from the "Today" and "Needed now" groups, e.g. the "STAT 2126 textbook" request shown as "4d ago" under "Today".

## B4 (P1): Points copy matches the actual values

- The Rewards banner says *"Lend an item +25 · Return on time +10 · Pass it on +15"*, but lending awards 15-55 by urgency (observed +40). Change it to *"Lend: 15-55 points by urgency · On-time return +10 · Pass it on +15"* (adjust after A4).

## B5 (P1): Prepare study data clears non-study loans

- "Prepare study data" leaves old loans in "Sam's open loans" (e.g. two "Engineering Scale Ruler & Compass Kit · Mei lends to P01", "Lab safety goggles · Sam lends to Student 02"). Prepare must close or delete loans that don't involve S01-S12 or the simulated classmates, and duplicates.

## B6 (P1): Consistent naming and steps

- The same account shows as "S01" in the console and "Student 01" in loan lists. Use one.
- The progress tracker has 5 steps when borrowing via Ask (Chat, Offer, Accepted, Picked up, Returned) and 4 when lending (Requested, Accepted, Picked up, Returned). Either use one model or label the difference.

---

## C1 (P2): Typing indicator for simulated replies
Show *"<Name> is typing…"* while a simulated reply is pending (replies take 5-10 s; posting a request takes about 10 s). Lecture guidance: responses over 1 s need feedback.

## C2 (P2): In-app confirm sheet for claiming rewards
Claiming uses `window.confirm("Claim \"<reward>\" for N points?")`. Replace it with an in-app bottom sheet (Cancel / Claim) in the app's style. Embedded browsers suppress native dialogs, so the claim silently fails there.

## C3 (P2): Rename "help chain"
Replace "help chain" wording (e.g. *"The help chain grew by one"*, *"See the help chains"*) with neutral copy, e.g. *"You passed help on. 1 more student helped."* and *"See how help has travelled"*.

## C4 (P2): Times relative to the scenario
Meet and return times currently use the real clock (observed "Back by 12:44 AM", a T3 return of 2:26 AM). In study mode, base times on the scenario (2 p.m. start; meet within 15 min; return within 3 h), or cap return times to the same day by 9 p.m.

---

## Out of scope

- Security-rule, auth or Cloud Function changes beyond A1's copy and UI.
- Visual redesign. Keep the current components and tokens.
- Changes to v1/v2 in this repo.
- Facilitator sign-in skipped the emailed code during the run (audit log: "admin signed in no code"). This is a configuration decision for the team. Either re-enable the code or update the report. Don't change it without asking.
