# UniLend v3: UI/UX proposals grounded in the lecture slides

Written 2026-11-17 from a walkthrough of the live app (student and facilitator views, 375x812) against Lec 1-8.

**Timing rule: don't ship these before testing day.** Test the current design first (with only the P0 fixes from `IMPLEMENTATION_SPEC.md`), so P3 has a baseline. Then pick the proposals that the test findings support, change one thing per uncertainty (Lec 7, Lean UX), and retest the changed paths. Each proposal states the evidence to look for on testing day.

Priority: **H** = likely to matter for the core loop · **M** = clear improvement · **L** = polish.

| ID | Pri | Principle (lecture) | Observed now | Proposal | Evidence to look for on testing day |
|---|---|---|---|---|---|
| U1 | H | Feedback; Golden Rule 4, closure (Lec 3, 8) | After pickup, return and claim, the page just changes state | A short success state after every hand-off, return and claim (see spec A3), stating what happened and what's next | Participants asking "is that it?" or "did it work?" |
| U2 | H | Good IxD gives a map: where you are, how to move, how to get back (Lec 1) | "Right now" said "Nothing needs you right now" while a chat with Alex was waiting | "Right now" lists every open item that needs the user: new replies, offers, pickups, due dates | Participants hunting through Inbox or Loans for the chat |
| U3 | H | Consistency; affordance (Lec 3, 8) | On "Your requests", tapping the request title does nothing; only the nested "Alex · Chatting" row opens it | Make the whole card one tap target; keep one chevron | Taps on the title with no response (note-taker counts off-route taps) |
| U4 | H | Real-world mapping; jargon-free (Lec 2) | The same idea has different names: "hand-off code", "pickup code", "QR"; "Loans & Exchanges"; "Next step" | One vocabulary: "Pickup code" and "Return code", "Your loans", "What to do next" | Think-aloud confusion about what the code is for |
| U5 | H | Highlight one primary action per screen (Lec 2) | Pass-It-On shows 4 choices with equal weight (Lend, Answer, Pledge, Not now) | One primary action ("Answer a request near you", showing a live request), with "Lend something" and "Not now" as quiet links | Time spent on the Pass-It-On screen; outcome counts |
| U6 | H | Motivation and values (Lec 3); intrinsic vs extrinsic (Discussion) | Pass-It-On leads with points ("you earned 15 points") | Lead with impact: "Priya still needs a charger in the library. You could be the one who helps." Show points second | Post-test Q1 answers; whether people choose to help |
| U7 | M | Permit easy reversal of actions, Golden Rule 6 (Lec 3); all user actions must be reversible (Lec 8) | No visible way to withdraw a posted request, undo accepting an offer or undo a claim | "Cancel request", "Withdraw" before pickup, and a 10-second "Undo" toast after claiming | Participants worrying aloud about committing |
| U8 | M | Error prevention (Lec 2); reduce memory load, Golden Rule 8 (Lec 3) | The offer shows "Tue 8:44 PM" and "Wed 12:44 AM" with no relative time | Show both: "in 20 min (8:44 PM)", "Back by tonight 11 PM (in 3 h)"; warn if the return time is after the building closes | Participants re-reading times or accepting odd hours |
| U9 | M | Response time: 1 s keeps flow, 10 s needs feedback (Lec 8) | Posting takes about 10 s with "Posting…"; replies take 5-10 s with no indicator | Optimistic posting (show the card at once); "Alex is typing…" (spec C1) | Participants re-tapping or saying "nothing's happening" |
| U10 | M | Limit options; essential content (Lec 2); simplicity (Lec 8) | Home lists about 32 lendable items below 6 requests; Rewards opens with 54 rewards | Home: 4 items plus "See all"; Rewards: default to "What I can claim now" and the next 3 in reach | Scrolling past the target; time to find Rewards (T3b) |
| U11 | M | Mobile context: interruptions, weak connections (Lec 8) | The app needs the internet; I saw no offline or reconnect state | A connection banner; keep drafts (Ask form, chat text) if the app reloads | Any network drop on testing day |
| U12 | M | Mental models (Lec 4) | Points appear in the header with no first-time explanation | A one-time explainer after the first earn: "Points show the help you've given. They can't be cashed." | Post-test comments about points meaning money |
| U13 | M | Trust and stress (Lec 3: user motivation, stress); safety (P1) | The lender's profile is one tap away but not at the decision point | On the offer card: "Alex · lent 6 times · returns on time" and the public meeting spot | Hesitation before "Accept offer" |
| U14 | M | Accessibility: perceivable, operable (Lec 1, 8; Lec 9) | Some sidebar navigation links had no accessible name in the accessibility tree; status uses colour chips; a colour-blind mode exists but is optional | Name every icon link; never rely on colour alone (add an icon or word); tap targets 44 px or more; check contrast of white text on the terracotta buttons (WCAG AA 4.5:1) | Automated check (axe/Lighthouse) before P3 |
| U15 | M | Colour: palettes, not colour pollution; colour carries meaning (Lec 4, 8) | The near-black, cream and terracotta palette closely matches what most groups used (instructor announcement) | Pick a distinct, limited palette with meaning: one action colour, and status colours used only for status. Justify it in P3 | Not a testing-day measure; a design-rationale point |
| U16 | L | Simplicity; consistency (Lec 8) | The hamburger menu repeats the bottom navigation; the bell and the Inbox dot both signal new messages | Remove the hamburger on mobile; one notification entry | Taps on both |
| U17 | L | Shortcuts for frequent users, Golden Rule 2 (Lec 3) | Every request starts from an empty form | "Ask again" on past requests; quick chips for common items (charger, calculator, adapter) | Not testable in one session; note as future work |
| U18 | L | Consistency, Golden Rule 1 | 5-step tracker when asking, 4-step when lending; "S01" vs "Student 01"; points copy doesn't match values | One tracker model; one name format; copy that matches values (spec B4, B6) | Questions about the step counts |

## How to use this in P3

For each proposal you adopt, write one line in this form:

> Observation (n of 10, quote) → principle (lecture) → change → retest result.

This is the "finding and revision" loop from Lec 7. It's also the strongest answer to the feedback that the design came from AI-led brainstorming: the changes come from your own users.
