# Specification

## Summary
**Goal:** Update the Login screen to clearly announce the shop is discontinued (in German) and prevent any user from signing in or accessing authenticated areas.

**Planned changes:**
- Add a full-width, pinned yellow marquee-style banner at the top of the Login screen with a German discontinuation message.
- Disable all login interactions on the Login screen (inputs and submit), including preventing Enter key submission and any login action from firing.
- Ensure any previously persisted “authenticated” client state is ignored/cleared so the app always shows the discontinued Login experience and never routes to Shop/Admin.
- Apply a cohesive discontinued/caution styling on the Login screen consistent with the existing warm amber/yellow/orange palette (no blue/purple dominant accents).

**User-visible outcome:** Users see a prominent scrolling German discontinuation notice on the Login screen and cannot sign in or access Shop/Admin, even if they were previously logged in.
