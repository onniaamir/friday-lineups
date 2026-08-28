# Friday Lineup Reveal

An opinionated vertical Remotion video for revealing three weekly five-a-side
football teams, substitutes, and optional neutral goalkeepers.

This repository contains the rendering engine, formation logic, weekly CLI,
backgrounds, fonts, and a Codex skill. It intentionally contains no player
registry, weekly lineup, attendance, player media, group icon, soundtrack, or
lineup history. All group-specific material lives in one ignored
`private-data/` directory.

The project does not render immediately after cloning. Add your private data,
run the setup command, and then use the normal workflow.

## Requirements

- Node.js 20 or newer
- npm
- FFmpeg for the WhatsApp-compatible export

## First-time setup

```bash
npm install
```

Create the required `private-data/` structure described in
[PRIVATE_DATA.md](PRIVATE_DATA.md), then run:

```bash
npm run setup:private
npm run typecheck
npm run studio
```

`setup:private` creates ignored symlinks from the code's existing runtime paths
to the canonical files under `private-data/`. It is safe to run repeatedly and
refuses to overwrite regular files.

## Recommended weekly workflow

The repository includes the `generate-friday-lineups` Codex skill under
`skills/generate-friday-lineups/`. Make it available to Codex, open the project
directory, and invoke `$generate-friday-lineups` with the blue, white, and red
team lists plus optional neutral goalkeepers.

The workflow:

1. Parses pasted aliases and guest notation into temporary JSON.
2. Resolves permanent players and the optional captain for each team through
   `private-data/src/player-registry.ts`.
3. Rejects unknown, ambiguous, duplicate, or out-of-team captain identities.
4. Proposes five starters, positions, substitutes, and captains.
5. Stops for explicit human approval.
6. Writes the approved active lineup to
   `private-data/src/weekly-lineup.ts`.
7. Archives stable player IDs and week-only guest references under
   `private-data/lineups/YYYY-MM-DD.json`.
8. Type-checks, renders, and creates a verified WhatsApp-compatible MP4.

The underlying commands are:

```bash
npm run weekly -- plan --input /tmp/friday-lineups-input.json --output /tmp/friday-lineups-plan.json
npm run weekly -- show --plan /tmp/friday-lineups-plan.json
npm run weekly -- apply --plan /tmp/friday-lineups-plan.json
npm run render:weekly -- --date YYYY-MM-DD
```

Do not run `apply` until the formation is explicitly approved.

To show captain badges in the reveal and final summary, include all three
captains in the weekly input. Each value must resolve to a registered player on
that team:

```json
{
  "captains": {
    "blue": "blue captain alias",
    "white": "white captain alias",
    "red": "red captain alias"
  }
}
```

Captain selection is optional for compatibility with older lineups. When
supplied, the captain is called out in the proposal, rendered with a captain
badge, and placed first in that team's final-summary row.

## Player names and aliases

`private-data/src/player-registry.ts` is the source of truth for stable player
IDs, display names, aliases, preferred positions, and asset paths.

Name resolution normalizes Unicode, whitespace, letter case, and leading `~`
characters commonly found in copied contact names. It then requires an exact
match against the player's display name or saved aliases. Unknown names stop
the workflow instead of being guessed.

Add confirmed recurring spelling variations to that player's `aliases` array.
When a weekly input does not resolve uniquely, first confirm whether it is a
new player or an alias for an existing one. Save a confirmed existing mapping
as an alias. For a new player, confirm the exact video display name and role or
position preferences before adding a stable registry entry; player artwork is
optional.

Every permanent profile's `assetFolder` must have a corresponding ignored local
directory. `npm run setup:private` creates missing player directories, and the
same operation is available directly as `npm run sync:player-folders`. Empty
folders contain no dummy files; add real media later using the names below.

When more than one registry profile matches the same name, the planner lists
the matching display names and stable IDs. Select the intended stable ID for
that week. Do not save a shared ambiguous spelling as an alias; save a new
distinguishing alias only after the user supplies one.

The weekly skill communicates in English while preserving Hebrew player names
verbatim. The rendered video itself remains Hebrew/RTL.

## Temporary guests

Guests belong to one weekly plan and never receive registry entries, aliases,
asset folders, or media requirements. Supported input forms include:

- `<player> +1`: include the registered player and one guest;
- `guest of <player>`, `+1 of <player>`, or `אורח של <player>`: include only
  the guest;
- `חבר <player>`, `חבר של <player>`, or `friend of <player>`: include only guest
  number 1;
- `חבר <player> 2`: include only guest number 2, displayed as `<player> +2`;
- `{ "guestOf": "<stable-player-id>", "guestNumber": 2 }`:
  structured form using the host's stable ID, optional explicit ordinal, and
  optional custom weekly display name.

Each guest receives a week-only ID such as `guest:<stable-player-id>:1`, defaults to no
outfield position preference, and uses the standard visual placeholder. The
approved private archive retains the host relationship, but the permanent
player registry is unchanged.

## Player media

Store each player's reusable files here:

```text
private-data/assets/players/<player-folder>/image.png
private-data/assets/players/<player-folder>/poster.png
private-data/assets/players/<player-folder>/lineup-static.png
private-data/assets/players/<player-folder>/lineup-clip.mp4
```

Use a stable Latin-character folder name. In the private registry, refer to the
files through the Remotion-visible prefix:

```text
private/players/<player-folder>/image.png
private/players/<player-folder>/poster.png
private/players/<player-folder>/lineup-static.png
private/players/<player-folder>/lineup-clip.mp4
```

The animated player reveal prefers a lineup clip when present and otherwise
uses the available lineup static, poster, or image. Other scenes select from
those still-image fields as appropriate, with a styled placeholder when no
player artwork is registered. Player media is therefore optional.

## Current design assumptions

- 1080×1920 vertical output at 30 FPS
- Teams identified as `blue`, `white`, and `red`
- Five outfield starters: `CB`, `LB`, `RB`, `LF`, and `RF`
- Additional team members become substitutes
- Optional neutral goalkeeper pool
- Hebrew/RTL presentation with Anton and Heebo typography
- Team-specific backgrounds with calibrated pitch bounds
- Fixed opening and closing layouts

See [AGENTS.md](AGENTS.md) for the exact code map an agent should inspect when
adapting these assumptions.

## Rendering

```bash
npm run studio
npm run still
npm run render
npm run render:weekly -- --date YYYY-MM-DD
```

Generated renders go to `out/` and remain ignored.

## Before publishing

```bash
npm run check:public
git status --short
git diff --cached
```

The public check inspects files visible to Git, not ignored files on disk. Your
private data can remain installed locally while you review or publish code.

## License

Project code is available under the MIT License. Bundled fonts retain their SIL
Open Font License terms; see `public/fonts/README.md`.
