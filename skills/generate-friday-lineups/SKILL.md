---
name: generate-friday-lineups
description: Plan, approve, and render this repository's weekly vertical Remotion lineup video from pasted blue, white, and red team lists, temporary guests, and optional neutral goalkeepers. Use when the user provides weekly football teams, mentions a player plus-one, guest, or friend marker such as חבר followed by a player name, asks for a Friday lineup or team-reveal video, or invokes $generate-friday-lineups. Communicate in English, explicitly resolve unknown or ambiguous identities as an existing alias, permanent new player, or week-only guest, require formation approval, then create the WhatsApp-compatible MP4.
---

# Generate Friday Lineups

Work from the repository root containing `package.json`. Reuse the project's
private registry, formation algorithm, design, timing, audio, and rendering
pipeline. Do not recreate them inside the skill.

## Communicate in English

Write every explanation, question, warning, status update, and approval request
in English. Preserve Hebrew player names exactly as supplied or registered. The
rendered video may remain Hebrew; do not use its language for the conversation.

## Verify private setup

Run:

```bash
npm run setup:private
```

If it reports missing files, stop and direct the user to `PRIVATE_DATA.md`. Do
not invent player data, use public examples, or create placeholder registries.

## Parse the request

Require blue, white, and red team lists. Ask for one captain from each team when
the user has not identified them. Default goalkeepers to an empty list.
Accept five or more participants per team after guest expansion. Use an
explicit match date when supplied; otherwise use the upcoming Friday in the
local timezone, including today when it is Friday.

Write `/tmp/friday-lineups-input.json`:

```json
{
  "date": "YYYY-MM-DD",
  "teams": {
    "blue": ["pasted player aliases"],
    "white": ["pasted player aliases"],
    "red": ["pasted player aliases"]
  },
  "captains": {
    "blue": "captain alias from the blue team",
    "white": "captain alias from the white team",
    "red": "captain alias from the red team"
  },
  "goalkeepers": []
}
```

Captains must be registered players who appear on their named team. Preserve
the supplied captain spelling and let the CLI resolve it exactly like other
registered-player input. Never infer captains from list order, formation, or
past weeks.

Preserve `registered player +N`; the CLI expands it to the registered player and
N temporary guests. Treat `guest of registered player`, `friend of registered
player`, `+1 of registered player`, and `אורח של registered player` as a guest
without automatically adding the host. Also treat `חבר <player>` and
`חבר של <player>` as one guest only. A trailing number is the explicit guest
ordinal: `חבר <player> 2` means `<player> +2`, not two guests and not the
registered player.
For an explicit guest, prefer the structured form:

```json
{"guestOf": "confirmed-stable-player-id", "guestNumber": 2, "displayName": "optional weekly name", "positions": ["optional positions"]}
```

Omit `guestNumber` to assign the next available ordinal. Omit `displayName` to
show `<host display name> +N`. Omit `positions` to give the guest no outfield
preference. Never add a guest to the permanent registry or create an asset
folder, alias, or media path for the guest.

## Propose the formation

Run:

```bash
npm run weekly -- plan --input /tmp/friday-lineups-input.json --output /tmp/friday-lineups-plan.json
```

The command owns alias resolution, duplicate checks, captain membership,
starter selection, substitute selection, missing-artwork reporting, and plan
validation.

### Resolve an unrecognized or ambiguous name

Treat identity as a mandatory checkpoint. Never guess from a similar spelling,
silently substitute another player, or edit the pasted name merely to make the
command pass.

For a name with no exact match, stop and ask in English:

> I could not match `<name>`. Is it an alias for an existing player, a permanent
> new player, or a temporary guest of a registered player? If it is an alias or
> guest, tell me which registered player. If it is new, confirm the display name
> and preferred role or positions (`GK only`, `CB`, `LB`, `RB`, `LF`, `RF`, or
> no outfield preference).

If the CLI reports multiple exact matches, quote every candidate display name
and stable ID and ask which one is intended. After selection, use that stable ID
in the temporary input for the current week. Do not append the shared spelling
to `aliases`, because it would remain ambiguous. Offer to save a distinct full
name or other unique alias only if the user provides one.

Then follow exactly one path:

- **Existing player:** after the user identifies the player, append the exact
  incoming spelling to that profile's `aliases` in
  `private-data/src/player-registry.ts` only if the spelling uniquely identifies
  that profile. Do not change `displayName`. The user's explicit mapping
  authorizes saving this recurring alias; mention that it was saved.
- **New player:** require confirmation of the exact `displayName` and position
  preferences before editing the registry. Propose a unique lowercase Latin
  stable ID and matching asset-folder slug when they are not obvious. Use all
  five outfield positions only when the user says there is no outfield
  preference; use an empty position list for a confirmed goalkeeper-only
  player. Set `assetFolder` to `private/players/<confirmed-slug>`, then run
  `npm run sync:player-folders` to create the corresponding ignored directory
  at `private-data/assets/players/<confirmed-slug>/`. Create no dummy image,
  README, or keep file. Add no media paths until real files exist; missing
  artwork will use the existing placeholder.
- **Temporary guest:** require one confirmed registered host. Replace the
  unresolved input with a structured guest object using the host's stable ID.
  Optionally preserve a supplied weekly guest name or positions. Do not edit
  the registry. Explain that the guest exists only in this week's private plan
  and archive and will use a placeholder.

After adding a permanent player, run `npm run sync:player-folders` and verify
that their declared directory exists. After any registry update, run
`npm run typecheck`. Recreate the temporary input as necessary and rerun `plan`.
If another name is unresolved or ambiguous, repeat the identity checkpoint.
Registry validation is allowed before a proposal; do not apply or render a
formation without the separate approval below.

Present the printed formation in a fenced text block so spacing remains
readable.

### Require approval

Stop after the proposal and ask the user to approve or request changes. Do not
run `apply`, type-checking, Remotion, FFmpeg, or another generation step in the
proposal turn. An initial request to generate immediately is not pre-approval.

## Revise a proposal

Edit `/tmp/friday-lineups-plan.json` using registered stable IDs and existing
week-only guest IDs. Preserve:

- every listed player exactly once within the team;
- one player in each of `CB`, `LB`, `RB`, `LF`, and `RF`;
- every remaining player in `substitutes`;
- each team's approved `captainId` on that same team;
- the original `playerOrder` unless the roster changes.

Validate and display the revision:

```bash
npm run weekly -- show --plan /tmp/friday-lineups-plan.json
```

Stop again for explicit approval. A revision request is not approval.

## Apply and render

Proceed only after explicit approval. If the draft plan is unavailable, ask for
the teams again.

Run:

```bash
npm run weekly -- apply --plan /tmp/friday-lineups-plan.json
npm run render:weekly -- --date YYYY-MM-DD
```

The first command writes `private-data/src/weekly-lineup.ts` and archives the
approved stable IDs plus temporary guest definitions under
`private-data/lineups/YYYY-MM-DD.json`. The second validates TypeScript, renders
the Remotion master, creates an H.264/AAC
`yuv420p` fast-start MP4, and verifies it.

Return the absolute path to `out/friday-lineups-YYYY-MM-DD-whatsapp.mp4`.
Mention missing artwork only as a non-blocking placeholder warning. Do not
redesign scenes or change permanent position preferences during a routine run.
