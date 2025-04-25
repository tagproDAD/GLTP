# 📝 Project TODOs

This document tracks tasks and ideas for the project. Items are grouped by category for clarity.

---


## 🚧 In Progress

- [ ] Valerian Website changes

---

## 🔜 Upcoming Tasks & Ideas

- [ ] UserScript for ghost mode
- [ ] Combine two replays into one, automated
- [ ] Automate GLTP speedrun uploads
- [ ] Python script to calculate OFM hold time from replay
- [ ] Click on a **player name** to view their world records
- [ ] Show a player's **fastest time on each map** (even if not a WR)
- [ ] Click on a **map name** to instantly launch a group with that map selected
- [ ] Display **total number of completions** per map
- [ ] Separate Classic / Grav maps on leaderboard
- [ ] Implement map voting (with account system or signup to ensure one vote per person) difficulty and fun ratings
- [ ] Move bot workflow to cloud
- [ ] Launch minigames from bot
- [ ] Better maps classification/categories in spreadsheet
- [ ] Document Atomic Mechs
- [ ] Documentation

---

## 🧠 Ideas / Brainstorm

- [ ] link to the GLTP discord (kinda a pain because it expires)
- [ ] link to the grav bot group (same pain, group link changes)
- [ ] GLTP Signups
- [ ] Grav Versus tourneys/elos (shift, pinecone, ofm, etc)
- [ ] Discord bot
- [ ] UserScript for zombies mode
- [ ] Auto generated new maps
- [ ] Button to spawn a new group with a new bot
- [ ] https://www.speedrun.com/TagPro


---

## 🐛 Known Bugs

- [ ] Login form sometimes submits twice on mobile
- [ ] Image uploads occasionally fail in Safari
- [ ] Modal background click not dismissing as expected

---

## 📌 Notes

- Prioritize accessibility (a11y) improvements after MVP

---

## 🛠️ Bot v1.4 – In Progress / TODO

- [ ] `ADDREPLAY` command
- [ ] Map selection stability: Ensure a launched map is the actual one played
- [ ] Map knowledge stability: Fix bot thinking the wrong map is active
- [ ] Incorporate Max Balls Record
- [ ] `@property` for central game/lobby/world state. Derive all logic from this
- [ ] `QUEUE` command:
  - `QUEUE` → list current queue
  - `QUEUE <preset>` or `QUEUE <map name>` → add to queue
- [ ] `REPLAY` → enqueue same map again
- [ ] `LAUNCHMAP <map name>` or `<map id>`
- [ ] Move AFKs to "waiting" area

---

## 🧪 Bot v1.5 – Planned Features

- [ ] Announce new WRs as they occur
- [ ] `WR`: Show "Gates Unlocked" stat
- [ ] Speedrun improvement:
  - For maps with no checkpoints, count time from spawn to cap (avoid relaunching)

---

## 🧭 Bot v1.6 – Voting & Launch Experience

- [ ] Notify: "Preparing next map: (map details)"
  - Add launch delay
  - Inform users of voting options and default behavior
- [ ] Add lobby voting:
  - `SKIP`: vote to load a random different map
  - `LAUNCH`: vote to run current map
  - `REPLAY`: vote to run previous map again
- [ ] Add in-game voting:
  - `ABORT`: vote to cancel the current game

---

## 🔮 Bot v1.X – Ideas & Future

  - [ ] `KB Interrupt`: Leave group immediately if interrupted
  - [ ] `MAP` statistics:
    - Completion Rate: `<% capped>`
    - Median Time: `<median of last 9 plays>`
  - [ ] Weigh periodic messages:
    - Based on fun rating
    - Frequency adjusted by recency
  - [ ] Exponential decay for recency:
    - `recency_score = 1` if never played
    - `0.1` if more than 24 hours ago
    - `0` if within last 24 hours
  - [ ] Detect broken group: Check `/find` without `/game`
  - [ ] Checkpoints: Allow creation of new map variant mid-game
  - [ ] Auto-tune settings based on WRs
    - e.g. `besttime: [0, 60]` by default

---

## ✅ Bot v1.3 – Completed Tasks

- ✅ Enforce group is listed publicly, even when playing private games
- ✅ `INFO` command
- ✅ Automatically create the group if not found
- ✅ Use aggregate fun rating
- ✅ `LAUNCHNEW <preset> <map ID override>`
- ✅ Don't pull new map if no users
- ✅ Log game (replay) UUID
- ✅ Fix empty preset crashing bot bug
- ✅ Add WR to `MAP` command, post-process world records in a separate thread
- ✅ Save all replays; setup pipeline to resolve world records
- ✅ Add 1-second delay between preset load and launch to avoid partial preset update bug
- ✅ Say map name when game is launched (in addition to `MAP` command)
- ✅ Bug fix: when dad joined, bot launched previous (stale) map instead of getting new one
- ✅ `MODERATE` command
- ✅ Preset info in `MAP` command
- ✅ `INFO <query>`
- ✅ Support multiple-caps-to-win maps (e.g., races)
- ✅ Bugfix: map difficulty not shown mid-game
- ✅ WR quotes (last message sent by WR cap)
- ✅ `REGION` command

---

## ✅ Bot v1.4 – Completed Tasks

- ✅ Pseudo Map ID support
- ✅ Mars ball fix (why no Mars buddy climb record?)
  - ℹ️ Requires map changes:
    - For Mars ball cap: set score to 3
    - For Mars flag cap: ensure blue-only cap support
- ✅ Incorporate `allow blue caps` column

---

## ✅ Completed

- [x] Website WRs
- [x] Website GLTP S2

---

💡 *Want to contribute? Fork the repo and submit a PR with your feature branch!*  
