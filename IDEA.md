# Desktop 1999: The Last Login
> **Status:** Working project concept — team to approve story details and final scope.  
> **Event:** FirstYearHack 2026 · **Track:** Retro Remix — Old Tech, New Tricks  
> **Repository:** `kwerui/KCL-FYH` · **Submission deadline:** 18:00 on 21 November 2026 (draft by 17:30)

## 1. One-sentence pitch
A browser-based escape room disguised as a late-1990s desktop: investigate a missing programmer through emails, deleted files, a calendar and a terminal to uncover why a computer from 1999 is receiving messages from **2026**.

## 2. Why this fits Retro Remix
- **Old technology:** A fictional Windows 95/98-era desktop experience: desktop icons, overlapping windows, taskbar, Start menu, Inbox, Recycle Bin and command prompt.
- **New trick:** The *operating system itself* is an interactive escape-room puzzle, with connected evidence and a time-bending mystery.
- **Surprising but faithful:** Familiar interactions (opening windows, restoring files and typing commands) become the mechanism for solving the story.
- **Judge-friendly:** A playable investigation with a beginning, three clear puzzle beats and an ending; no login or complex setup required.

## 3. Player experience and objective
**Setting (proposed):** New Year's Eve, 1999. The player switches on an abandoned computer. Its owner, a programmer working on a secret experiment called **Project ECHO**, is missing. Several files bear impossible **2026** timestamps.

**Goal:** Gather clues, unlock the hidden Project ECHO file and activate its final console command to discover the truth before a scheduled system wipe.

**Core loop:** Open an app → read evidence → connect clues → enter an answer or restore a file → unlock the next piece of the mystery.

**Win condition:** Successfully unlock the final terminal screen and make a final choice. Both branches count as completing the game.

## 4. Proposed three-puzzle sequence
These clues and answers are **provisional**, but intentionally complete enough to implement without gaps.

| Step | Player action | Where the clue lives | Correct answer / effect |
|---|---|---|---|
| **1. Recover evidence** | Open **Inbox**, see an email hinting that the owner threw away the access note; open **Recycle Bin** and restore `note.txt`. | Inbox → Recycle Bin | The restored note appears in **My Files**; it says: “The lock uses the final day of 1999, in DDMM format.” |
| **2. Unlock the archive** | Open the locked **ECHO Archive** in **My Files** and enter its four-digit password. | Restored `note.txt` + Calendar showing 31 December 1999 | Password: **3112**. The archive opens, revealing `transmission.txt` with the code **5-3-8-15** and the hint “A1Z26”. |
| **3. Decode and connect** | Decode 5-3-8-15 as **ECHO** and type `ECHO` into the fictional **Project Console**. | Archive → Terminal | The console recognises **ECHO**, exposes a message transmitted from 2026 and offers the player's final decision. |

**Final reveal (proposed):** Project ECHO was built to send information across time. The missing programmer triggered the experiment and is now communicating from 2026. The player chooses **SEND** (reply, keep the connection open) or **ERASE** (destroy the evidence, end the connection). Each option shows a short, distinct ending.

**Fair-play design:** Nothing depends on guessing an undocumented command. The Terminal displays `HELP`, and `transmission.txt` explicitly tells the player where to enter the decoded keyword.

## 5. MVP — what must work by submission
- [ ] Browser loads directly into a convincing 1990s-style desktop.
- [ ] Desktop icons open **Inbox**, **My Files**, **Recycle Bin**, **Calendar**, **Terminal**.
- [ ] Windows open/close/focus; dragging is desirable but not required for puzzle completion.
- [ ] All three puzzle stages work in order, with clear feedback for incorrect answers.
- [ ] State tracks whether the note was restored, archive unlocked and terminal solved.
- [ ] Final reveal and at least one complete ending work from a fresh session.
- [ ] Game can be reset/replayed; basic keyboard support and legible text.
- [ ] App runs locally with a simple `npm install && npm run dev` and `npm run build` passes.
- [ ] Team demonstrates real **JetBrains Air agent usage** and retains session evidence.
- [ ] GitHub README explains the game, how to run it and how to play; submission includes repo and demo.

### Stretch features (only after MVP)
- Draggable/resizable windows; retro boot screen and sounds (with mute).
- A hint system that escalates rather than spoils puzzles.
- Both ending branches fully illustrated.
- LocalStorage save/continue.
- Extra optional app (Chat / Paint / Internet Explorer-inspired browser).
- An AI character **only** if it clearly improves play and can be added safely in time.

### Deliberately out of scope
Accounts/login, true filesystem emulation, online multiplayer, sophisticated LLM integration, cloud database and full operating-system simulation.

## 6. Suggested technical architecture
**Stack:** React + Vite + TypeScript + CSS. No backend for the MVP.

**Conceptual structure (adapt to actual codebase):**
```text
src/
  components/
    Desktop.tsx
    DesktopIcon.tsx
    WindowManager.tsx
    AppWindow.tsx
    Taskbar.tsx
  apps/
    Inbox.tsx
    FileExplorer.tsx
    RecycleBin.tsx
    Calendar.tsx
    Terminal.tsx
  game/
    storyData.ts
    puzzleLogic.ts
    gameState.ts
  styles/
    retro.css
```

**Game state example:** `restoredNote`, `archiveUnlocked`, `echoActivated`, `ending`. Keep puzzle validation in pure functions; applications should render from shared state rather than hard-code completion checks in multiple places.

**Security:** No secrets in the frontend or commits. Use local deterministic puzzle logic.

## 7. Team division (up to three people)
| Owner | Workstream | Deliverable |
|---|---|---|
| **A — Desktop UI** | Desktop shell, icons, windows, taskbar, styles | Clickable, attractive 90s interface |
| **B — Game logic** | Shared state, password validation, terminal input, endings | Reliable end-to-end puzzle progression |
| **C — Narrative + QA** | Email/document/calendar copy, clue placement, testing, README/demo | Coherent mystery with no dead ends |

Agree file ownership and interfaces before parallel work. Merge frequently. **Every participant must use JetBrains Air meaningfully** and keep their own session records.

## 8. Seven-hour build plan
| Time | Milestone |
|---|---|
| **11:00–11:30** | Agree final story/puzzles, assign tasks, initialise app, start Air sessions |
| **11:30–13:00** | Desktop shell + puzzle-state foundation in parallel |
| **13:00–14:30** | Complete apps and link all clues; first full playthrough |
| **14:30–16:00** | Polish visual feedback, fix progression bugs, add ending |
| **16:00–17:00** | Full team testing, fresh-start playthrough, build verification |
| **17:00–17:30** | Demo rehearsal, README, screenshots, submission draft |
| **17:30–18:00** | Final smoke test and **submit before 18:00** |

**Fallback if behind:** Cut dragging, optional apps, sounds, AI and second ending. Preserve a complete and demonstrable puzzle chain.

## 9. JetBrains Air compliance checklist (mandatory)
The event requires actually **building with JetBrains Air**, not merely installing IntelliJ or Codex. The student licence/Student Pack is not itself required if working IDE/agent access is available.

**After each meaningful Codex task run *inside* Air:**
1. Review the changes and run the relevant tests/app.
2. In IntelliJ open **Agent Sessions** and locate that session.
3. Right-click → **Copy Session Info → Session ID**; paste the ID into a private team note.
4. Right-click → **Copy Session Info → Session Log**; paste the resulting `.airsession` file into a **private folder outside the repository**.
5. Check the saved log exists and keep the original session until results are announced.
6. Commit reviewed working code to GitHub.

**Do not commit session logs or API keys.** Creating this IDEA.md document by itself is *not* evidence of Air usage.

## 10. Snowflake decision
**Default: skip Snowflake.** For a short, self-contained escape room it adds setup and deployment overhead without solving a core gameplay problem. Reconsider only if the MVP is working early and the team proposes a meaningful data-driven feature. A token database write is not a strong “Best Use of Snowflake” story.

## 11. Decisions the team should confirm
- [ ] Tone: **sci-fi detective** (default) or horror/thriller?
- [ ] Keep the missing programmer / Project ECHO storyline or replace it?
- [ ] Final-choice mechanic: **SEND / ERASE**, or a single ending?
- [ ] Visual reference: Windows 95/98-inspired or an original fictional OS?
- [ ] Who owns each workstream, and what are the Git branch conventions?
- [ ] What is the smallest reliable live demo the judges can finish in 2–3 minutes?

## 12. Two-minute judge demo script
1. **0:00–0:20:** “This looks like a 1999 desktop, but the desktop is the escape room.” Show taskbar/windows.
2. **0:20–0:50:** Open Inbox and restore the deleted note.
3. **0:50–1:15:** Use its date clue to unlock the archive with **3112**.
4. **1:15–1:40:** Decode **5-3-8-15 → ECHO**, enter it in Terminal.
5. **1:40–2:00:** Reveal the 2026 transmission and make a final choice.

---
*This is a living project brief: update decisions as the team agrees them. Prioritise the playable mystery over speculative features.*
