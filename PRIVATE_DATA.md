# Private data setup

All group-specific information and media must live under the repository-root
`private-data/` directory. The entire directory is ignored by Git.

## Required structure

```text
private-data/
├── src/
│   ├── player-registry.ts
│   ├── weekly-lineup.ts
│   └── final-summary-preview.ts
├── assets/
│   ├── players/
│   │   └── <stable-player-folder>/
│   │       ├── image.png
│   │       ├── poster.png
│   │       ├── lineup-static.png
│   │       └── lineup-clip.mp4
│   ├── branding/
│   │   └── group-icon.png
│   └── audio/
│       ├── lineup-theme.mp3
│       └── lineup-theme-trimmed.mp3
├── attendance/
├── lineups/
├── outputs/
└── archive/
```

The three TypeScript files, trimmed soundtrack, and group icon are required by
the current implementation. Player files are optional because missing artwork
uses placeholders. The untrimmed soundtrack, attendance, outputs, and archive
folders are organizational and are not read automatically by the renderer.

## Player registry

`private-data/src/player-registry.ts` must export:

- `PlayerProfile`
- `playerRegistry`
- `PlayerId`
- `findPlayerIds()`
- `resolvePlayerId()`
- `createLineupPlayer()`

Each profile contains a stable ID, display name, aliases, preferred outfield
positions, a stable asset folder, and optional media paths. Use paths beginning
with `private/players/`; `npm run setup:private` exposes
`private-data/assets/` to Remotion as `public/private`.

Keep typo handling explicit by adding verified spellings to `aliases`. Do not
use fuzzy matching for player identity. `resolvePlayerId()` must return a player
only when exactly one profile matches the normalized input; unknown and
ambiguous inputs must return `undefined`.

`findPlayerIds()` must return every exact normalized registry match so the
planner can distinguish an unknown name from two players who share a display
name or alias. Weekly input may use a confirmed stable player ID to bypass an
ambiguous display name. Do not add the same ambiguous alias to multiple
profiles.

For a new player, confirm the exact `displayName` and preferred positions before
adding the profile. Use a unique lowercase Latin stable ID and asset-folder
slug. When the player has no position preference, register all five outfield
positions. Use an empty position list for a goalkeeper-only player. Do not add
media fields until their corresponding private files exist.

Run `npm run sync:player-folders` after adding a permanent profile. It safely
creates any missing directory declared by `assetFolder` under
`private-data/assets/players/`. `npm run setup:private` also runs this sync.
Do not add placeholder images, README files, or `.gitkeep` files to these
private player folders.

Guests are not registry profiles. They are stored only in version-2 weekly
plans under `guests`, with a temporary ID, one registered `guestOf` player, a
weekly display name, an ordinal, and optional position preferences. A structured
weekly input may set `guestNumber`; otherwise the planner assigns the next
available ordinal. They require no asset folder or media.

## Active weekly lineup

`private-data/src/weekly-lineup.ts` must export `weeklyLineup` with the `Lineup`
shape from `src/types.ts`. Normally the weekly skill and CLI generate this file
after formation approval.

Each team may include a `captainId` matching one of its players' stable IDs.
The weekly CLI adds it from the approved `captains` input, and the renderer uses
it for the captain badge and captain-first final-summary order.

The current branding path is:

```text
private/branding/group-icon.png
```

## Final-summary preview

`private-data/src/final-summary-preview.ts` must export
`finalSummaryPreviewLineup`. It may reuse the active lineup or provide a
separate private preview fixture.

## Attendance and prior lineups

- Put attendance notes, screenshots, or source files under
  `private-data/attendance/`.
- Approved plans are written to `private-data/lineups/YYYY-MM-DD.json`.
- Attendance does not assign teams or positions automatically; the pasted
  weekly team lists remain the input to the planning workflow.

## Runtime links

After creating the required files, run:

```bash
npm run setup:private
```

This creates ignored links at:

```text
src/data/player-registry.ts
src/data/weekly-lineup.ts
src/data/final-summary-preview.ts
public/private
lineups
```

Those are compatibility paths for the existing code. Do not edit or commit the
links as independent data sources; edit their targets under `private-data/`.
