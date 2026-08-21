# Agent guide

## Project intent

Preserve this as an opinionated, working Remotion implementation. Do not turn it
into a generalized framework unless explicitly requested. Adapt the concrete
implementation when team count, formation, language, branding, or animation
requirements change.

## Private-data boundary

All group-specific data and media live only under ignored `private-data/`.
There are no tracked demo registries, example lineups, or player assets.

Before running project commands, verify the private setup:

```bash
npm run setup:private
```

Read `PRIVATE_DATA.md` when required files are missing. Never invent player data
or commit private files to make a clone pass checks.

The setup command creates ignored runtime links from `src/data/`,
`public/private`, and `lineups` to the canonical private directory. Edit the
targets under `private-data/`, not separate copies.

## Architecture

- `private-data/src/player-registry.ts`: IDs, display names, aliases, preferred
  positions, and private media paths.
- `src/data/formation.ts`: five-slot optimizer and substitute selection.
- `private-data/src/weekly-lineup.ts`: generated active lineup.
- `scripts/weekly-lineup-cli.ts`: plan, validate, show, and apply commands.
- `src/scenes/IntroScene.tsx`: fixed three-team opening.
- `src/scenes/TeamScene.tsx`: positional reveals and substitutes.
- `src/scenes/FinalScene.tsx`: fixed closing roster layout and visual order.
- `src/data/lineup-backgrounds.ts`: public backgrounds and pitch calibration.
- `src/timing.ts`: scene timing and total-duration calculation.
- `scripts/render-weekly.cjs`: type-check, Remotion render, FFmpeg export, and
  output verification.

## Name resolution

The skill parses informal team text, but repository code owns identity matching.
`resolvePlayerId()` normalizes Unicode, whitespace, case, and leading `~`, then
checks `displayName` and `aliases`. It does not perform fuzzy matching. Stop and
ask in English whether an unknown name is an alias for an existing player, a
permanent new player, or a temporary guest; never guess. For multiple exact
matches, list every matching display name and stable ID and ask which one was
intended. Use the selected stable ID for the current week; never save a shared
ambiguous spelling as an alias. After a unique mapping confirmation, save the
spelling in that player's aliases. For a confirmed new player, require the exact
display name and position preferences before adding a stable registry entry.
Keep Hebrew names verbatim while communicating with the user in English.

After adding a permanent registry profile, run
`npm run sync:player-folders` and verify the declared ignored asset directory
exists. Do not create dummy media or documentation inside it. Alias-only updates
and temporary guests never create player folders.

Guests use version-2 weekly participant IDs such as
`guest:<stable-player-id>:1`. They remain
in that week's private plan/archive, use placeholders, and never receive a
registry entry, alias, asset folder, or media path. `player +N` expands to the
registered player plus N guests; `guest of player`, `friend of player`,
`חבר player`, and `חבר של player` represent only the guest. A trailing number
on the friend form is the explicit guest ordinal, not a guest count.

## Weekly workflow

Use the included `generate-friday-lineups` skill when available:

1. Run `npm run setup:private`.
2. Parse blue, white, red, and optional goalkeeper lists into temporary JSON.
3. Run `npm run weekly -- plan ...`.
4. Present the proposed formation and stop for explicit approval.
5. Validate requested revisions with `show` using stable player IDs.
6. Only after approval, run `apply` and `render:weekly`.

`apply` writes directly to `private-data/src/weekly-lineup.ts` and
`private-data/lineups/`. Do not bypass the approval boundary.

## Customization map

### Team names or colors

Update team definitions in `scripts/weekly-lineup-cli.ts` and inspect contrast
logic in `TeamScene.tsx`, `FinalScene.tsx`, and `PositionGroupReveal.tsx`, which
currently treats `white` specially.

### Team count or order

Inspect the CLI team definitions and validation, `IntroScene.tsx` fixed team
selection, `FinalScene.tsx` fixed closing order, lineup backgrounds, and final
summary sizing.

### Starter count or formation

Update formation slots/scoring, CLI coordinates/validation, TeamScene positional
groups, timing substitute threshold, and formation/final-summary layouts.

### Language or output dimensions

Review hard-coded Hebrew labels, RTL properties, name sizing, font usage, and
all fixed 1080×1920 measurements before rendering.

## Verification

```bash
npm run setup:private
npm run typecheck
npm run check:public
npm run still
```

For timing, audio, transition, encoding, or layout changes, render the full
composition and inspect it. Before publishing, inspect all staged files even
after `check:public` passes.
