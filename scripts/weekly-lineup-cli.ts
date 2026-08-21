import * as fs from 'node:fs';
import * as path from 'node:path';
import {optimizeFormation} from '../src/data/formation';
import {createLineupPlayer, findPlayerIds, playerRegistry, type PlayerId} from '../src/data/player-registry';
import type {OutfieldPosition, Player} from '../src/types';

const projectRoot = path.resolve(__dirname, '..');
const slots: OutfieldPosition[] = ['CB', 'LB', 'RB', 'LF', 'RF'];
const slotCoordinates: Record<OutfieldPosition, {x: number; y: number}> = {
  CB: {x: 50, y: 68}, LB: {x: 22, y: 50}, RB: {x: 78, y: 50}, LF: {x: 32, y: 24}, RF: {x: 68, y: 24},
};
const teamDefinitions = {
  blue: {name: 'כחול', consoleName: 'Blue', emoji: '🟦', color: '#1677ff', accent: '#73b4ff'},
  white: {name: 'לבן', consoleName: 'White', emoji: '⬜️', color: '#f4f5f7', accent: '#ffffff'},
  red: {name: 'אדום', consoleName: 'Red', emoji: '❤️', color: '#ef3340', accent: '#ff858c'},
} as const;
type TeamId = keyof typeof teamDefinitions;
type GuestId = `guest:${PlayerId}:${number}`;
type ParticipantId = PlayerId | GuestId;

type GuestInput = {guestOf: string; guestNumber?: number; displayName?: string; positions?: OutfieldPosition[]};
type ParticipantInput = string | GuestInput;
type WeeklyInput = {
  date?: string;
  teams: Record<TeamId, ParticipantInput[]>;
  goalkeepers?: ParticipantInput[];
};
type GuestPlan = {id: GuestId; guestOf: PlayerId; displayName: string; positions: OutfieldPosition[]};
type TeamPlan = {
  id: TeamId;
  playerOrder: ParticipantId[];
  formation: Record<OutfieldPosition, ParticipantId>;
  substitutes: ParticipantId[];
};
type WeeklyPlan = {version: 2; date: string; guests: GuestPlan[]; teams: TeamPlan[]; goalkeepers: ParticipantId[]};
type LegacyWeeklyPlan = {
  version: 1;
  date: string;
  teams: Array<{
    id: TeamId;
    playerOrder: PlayerId[];
    formation: Record<OutfieldPosition, PlayerId>;
    substitutes: PlayerId[];
  }>;
  goalkeepers: PlayerId[];
};

const fail = (message: string): never => { throw new Error(message); };
const parseArgs = () => {
  const [command, ...rest] = process.argv.slice(2);
  const values = new Map<string, string>();
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!flag?.startsWith('--') || !value) fail(`Invalid argument near ${flag ?? '(end)'}`);
    values.set(flag.slice(2), value);
  }
  return {command, values};
};
const upcomingFriday = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + ((5 - date.getDay() + 7) % 7));
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};
const validateDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`Date must use YYYY-MM-DD, received: ${date}`);
  return date;
};
const readJson = <T>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
const isPlayerId = (value: string): value is PlayerId => value in playerRegistry;
const isGuestId = (value: string): value is GuestId => value.startsWith('guest:');
const normalizePlan = (plan: WeeklyPlan | LegacyWeeklyPlan): WeeklyPlan => {
  if (plan.version === 2) return plan;
  if (plan.version !== 1) fail(`Unsupported plan version: ${String((plan as {version?: unknown}).version)}`);
  return {version: 2, date: plan.date, guests: [], teams: plan.teams, goalkeepers: plan.goalkeepers};
};
const readPlan = (filePath: string) => normalizePlan(readJson<WeeklyPlan | LegacyWeeklyPlan>(filePath));

const formatMatches = (matches: PlayerId[]) =>
  matches.map((id) => `${playerRegistry[id].displayName} [${id}]`).join(', ');
const resolveRegisteredPlayer = (name: string, context: string, guestHost = false): PlayerId => {
  if (isPlayerId(name)) return name;
  const matches = findPlayerIds(name);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    fail(`Ambiguous player "${name}" in ${context}. Matching registered players: ${formatMatches(matches)}. Ask which player was intended before saving an alias or continuing.`);
  }
  if (guestHost) {
    fail(`Unrecognized guest host "${name}" in ${context}. A guest must be linked to one confirmed registered player; ask which registered player invited the guest.`);
  }
  fail(`Unrecognized player "${name}" in ${context}. Ask whether this is an alias for an existing player, a permanent new player, or a temporary guest of a registered player.`);
};
const validateGuestPositions = (positions: unknown, context: string): OutfieldPosition[] => {
  if (positions === undefined) return [...slots];
  if (!Array.isArray(positions) || positions.some((position) => !slots.includes(position as OutfieldPosition))) {
    fail(`${context} positions must contain only CB, LB, RB, LF, and RF.`);
  }
  if (new Set(positions).size !== positions.length) fail(`${context} contains duplicate positions.`);
  return positions as OutfieldPosition[];
};
const guestOnlyHost = (value: string): string | undefined => {
  const patterns = [
    /^\+\s*1\s+(?:of|for)\s+(.+)$/iu,
    /^guest\s+(?:of|for|over)\s+(.+)$/iu,
    /^plus\s+one\s+(?:of|for)\s+(.+)$/iu,
    /^אורח\s+של\s+(.+)$/u,
  ];
  return patterns.map((pattern) => value.match(pattern)?.[1]?.trim()).find(Boolean);
};
const friendGuest = (value: string): GuestInput | undefined => {
  const match = value.match(/^(?:חבר(?:\s+של)?|friend(?:\s+of)?)\s+(.+?)(?:\s+([1-9]\d*))?$/iu);
  if (!match) return undefined;
  return {
    guestOf: match[1].trim(),
    guestNumber: match[2] ? Number(match[2]) : undefined,
  };
};
const expandParticipantInput = (input: ParticipantInput, context: string): ParticipantInput[] => {
  if (typeof input !== 'string') {
    if (!input || typeof input.guestOf !== 'string' || input.guestOf.trim() === '') {
      fail(`${context} contains a guest without a non-empty guestOf value.`);
    }
    return [{...input, guestOf: input.guestOf.trim()}];
  }
  const value = input.trim();
  if (value === '') fail(`${context} contains an empty player name.`);
  const friend = friendGuest(value);
  if (friend) return [friend];
  const hostOnly = guestOnlyHost(value);
  if (hostOnly) return [{guestOf: hostOnly}];
  const plusMatch = value.match(/^(.+?)\s*\+\s*([1-9]\d*)$/u);
  if (!plusMatch) return [value];
  const host = plusMatch[1].trim();
  const guestCount = Number(plusMatch[2]);
  if (guestCount > 10) fail(`${context} cannot add more than 10 guests for one player.`);
  return [host, ...Array.from({length: guestCount}, () => ({guestOf: host}))];
};
const resolveParticipants = (
  inputs: ParticipantInput[], context: string, guests: GuestPlan[], guestCounts: Map<PlayerId, number>,
): ParticipantId[] => inputs.flatMap((input) => expandParticipantInput(input, context)).map((input) => {
  if (typeof input === 'string') return resolveRegisteredPlayer(input, context);
  const guestOf = resolveRegisteredPlayer(input.guestOf, `${context} guest`, true);
  if (input.guestNumber !== undefined && (!Number.isInteger(input.guestNumber) || input.guestNumber < 1 || input.guestNumber > 10)) {
    fail(`${context} guestNumber must be an integer from 1 to 10.`);
  }
  const guestNumber = input.guestNumber ?? (guestCounts.get(guestOf) ?? 0) + 1;
  const id = `guest:${guestOf}:${guestNumber}` as GuestId;
  if (guests.some((guest) => guest.id === id)) fail(`${context} contains duplicate guest ${playerRegistry[guestOf].displayName} +${guestNumber}.`);
  guestCounts.set(guestOf, Math.max(guestCounts.get(guestOf) ?? 0, guestNumber));
  const displayName = input.displayName?.trim() || `${playerRegistry[guestOf].displayName} +${guestNumber}`;
  const positions = validateGuestPositions(input.positions, displayName);
  guests.push({id, guestOf, displayName, positions});
  return id;
});

const guestMap = (plan: WeeklyPlan) => new Map(plan.guests.map((guest) => [guest.id, guest]));
const participantExists = (plan: WeeklyPlan, id: string): id is ParticipantId =>
  isPlayerId(id) || (isGuestId(id) && guestMap(plan).has(id));
const participantName = (plan: WeeklyPlan, id: ParticipantId) =>
  isPlayerId(id) ? playerRegistry[id].displayName : guestMap(plan).get(id)?.displayName ?? id;
const participantPositions = (plan: WeeklyPlan, id: ParticipantId): readonly OutfieldPosition[] =>
  isPlayerId(id) ? playerRegistry[id].positions : guestMap(plan).get(id)?.positions ?? slots;
const createPlanningPlayer = (plan: WeeklyPlan, id: ParticipantId): Player => {
  if (isPlayerId(id)) return createLineupPlayer(id, {position: 'CB', x: 50, y: 50});
  return {playerId: id, name: participantName(plan, id), position: 'CB', x: 50, y: 50, preferredPositions: [...participantPositions(plan, id)]};
};
const validateNoDuplicates = (plan: WeeklyPlan, groups: Array<{label: string; ids: ParticipantId[]}>) => {
  const seen = new Map<ParticipantId, string>();
  for (const group of groups) {
    for (const id of group.ids) {
      const previous = seen.get(id);
      if (previous) fail(`${participantName(plan, id)} appears in both ${previous} and ${group.label}.`);
      seen.set(id, group.label);
    }
  }
};

const buildPlan = (input: WeeklyInput): WeeklyPlan => {
  if (!input.teams) fail('Input must contain teams.blue, teams.white, and teams.red.');
  const guests: GuestPlan[] = [];
  const guestCounts = new Map<PlayerId, number>();
  const plan: WeeklyPlan = {version: 2, date: validateDate(input.date ?? upcomingFriday()), guests, teams: [], goalkeepers: []};
  plan.teams = (Object.keys(teamDefinitions) as TeamId[]).map((id) => {
    const inputs = input.teams[id];
    if (!Array.isArray(inputs)) fail(`${teamDefinitions[id].consoleName} must be an array.`);
    const playerOrder = resolveParticipants(inputs, teamDefinitions[id].consoleName, guests, guestCounts);
    if (playerOrder.length < 5) fail(`${teamDefinitions[id].consoleName} must contain at least five participants after guest expansion.`);
    const optimized = optimizeFormation(playerOrder.map((participantId) => createPlanningPlayer(plan, participantId)));
    const formation = Object.fromEntries(
      optimized.starters.map((player) => [player.position, player.playerId]),
    ) as Record<OutfieldPosition, ParticipantId>;
    return {
      id,
      playerOrder,
      formation,
      substitutes: optimized.substitutes.map((player) => player.playerId as ParticipantId),
    };
  });
  plan.goalkeepers = resolveParticipants(input.goalkeepers ?? [], 'Goalkeepers', guests, guestCounts);
  validatePlan(plan);
  return plan;
};

const validatePlan = (plan: WeeklyPlan) => {
  if (plan.version !== 2) fail(`Unsupported plan version: ${String(plan.version)}`);
  validateDate(plan.date);
  const expectedTeams = new Set(Object.keys(teamDefinitions));
  const seenGuests = new Set<GuestId>();
  for (const guest of plan.guests) {
    if (!isGuestId(guest.id) || seenGuests.has(guest.id)) fail(`Invalid or duplicate guest ID: ${guest.id}`);
    seenGuests.add(guest.id);
    if (!isPlayerId(guest.guestOf)) fail(`Guest ${guest.id} references an unknown registered player.`);
    if (guest.displayName.trim() === '') fail(`Guest ${guest.id} has an empty display name.`);
    validateGuestPositions(guest.positions, guest.displayName);
  }
  for (const team of plan.teams) {
    if (!expectedTeams.delete(team.id)) fail(`Unexpected or duplicate team: ${team.id}`);
    const starterIds = slots.map((slot) => team.formation[slot]);
    if (starterIds.some((id) => !id || !participantExists(plan, id))) fail(`${team.id} is missing a valid formation slot.`);
    const used = [...starterIds, ...team.substitutes];
    if (used.some((id) => !participantExists(plan, id))) fail(`${team.id} contains an unknown participant.`);
    if (new Set(used).size !== used.length) fail(`${team.id} uses a participant more than once in its formation.`);
    if (new Set(team.playerOrder).size !== team.playerOrder.length) fail(`${team.id} contains a duplicate participant.`);
    if (used.length !== team.playerOrder.length || used.some((id) => !team.playerOrder.includes(id))) {
      fail(`${team.id} formation and substitutes must use every listed participant exactly once.`);
    }
  }
  if (expectedTeams.size > 0) fail(`Plan is missing team(s): ${[...expectedTeams].join(', ')}`);
  if (plan.goalkeepers.some((id) => !participantExists(plan, id))) fail('Goalkeepers contain an unknown participant.');
  validateNoDuplicates(plan, [
    ...plan.teams.map((team) => ({label: teamDefinitions[team.id].consoleName, ids: team.playerOrder})),
    {label: 'Goalkeepers', ids: plan.goalkeepers},
  ]);
  const usedGuests = new Set([
    ...plan.teams.flatMap((team) => team.playerOrder.filter(isGuestId)),
    ...plan.goalkeepers.filter(isGuestId),
  ]);
  if (plan.guests.some((guest) => !usedGuests.has(guest.id))) fail('Plan contains an unused guest definition.');
};

const hasRegisteredAsset = (id: PlayerId) => {
  const profile = playerRegistry[id];
  const lineupClip = 'lineupClip' in profile ? profile.lineupClip : undefined;
  const lineupStatic = 'lineupStatic' in profile ? profile.lineupStatic : undefined;
  const poster = 'poster' in profile ? profile.poster : undefined;
  const image = 'image' in profile ? profile.image : undefined;
  return [lineupClip, lineupStatic, poster, image].some((asset) => asset && fs.existsSync(path.join(projectRoot, 'public', asset)));
};
const formationLine = (plan: WeeklyPlan, left: ParticipantId, leftPosition: string, right: ParticipantId, rightPosition: string) =>
  `        ${participantName(plan, left)} (${leftPosition})          ${participantName(plan, right)} (${rightPosition})`;
const printPlan = (plan: WeeklyPlan) => {
  console.log(`\nProposed lineups — ${plan.date}\n`);
  for (const team of plan.teams) {
    const meta = teamDefinitions[team.id];
    console.log(`${meta.emoji} ${meta.consoleName}`);
    console.log(formationLine(plan, team.formation.LF, 'LF', team.formation.RF, 'RF'));
    console.log('');
    console.log(formationLine(plan, team.formation.LB, 'LB', team.formation.RB, 'RB'));
    console.log('');
    console.log(`                         ${participantName(plan, team.formation.CB)} (CB)`);
    console.log('');
    console.log(`Substitutes: ${team.substitutes.length > 0 ? team.substitutes.map((id) => participantName(plan, id)).join(', ') : 'None'}`);
    console.log('');
  }
  console.log(`Goalkeepers: ${plan.goalkeepers.length > 0 ? plan.goalkeepers.map((id) => participantName(plan, id)).join(', ') : 'None'}\n`);
  console.log(`Temporary guests: ${plan.guests.length > 0 ? plan.guests.map((guest) => guest.displayName).join(', ') : 'None'}\n`);
  const allParticipants = [...plan.teams.flatMap((team) => team.playerOrder), ...plan.goalkeepers];
  const missingAssets = allParticipants.filter(isPlayerId).filter((id) => !hasRegisteredAsset(id));
  console.log(`Missing registered-player artwork: ${missingAssets.length > 0 ? missingAssets.map((id) => playerRegistry[id].displayName).join(', ') : 'None'}\n`);
  console.log('Nothing was rendered. Waiting for explicit formation approval.');
};

const formatDateForVideo = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
};
const playerExpression = (plan: WeeklyPlan, id: ParticipantId, position: OutfieldPosition | 'GK', substitute: boolean) => {
  const {x, y} = position === 'GK' ? {x: 50, y: 88} : slotCoordinates[position];
  const created = isPlayerId(id)
    ? `createLineupPlayer(${JSON.stringify(id)}, {position: ${JSON.stringify(position)}, x: ${x}, y: ${y}})`
    : `{playerId: ${JSON.stringify(id)}, name: ${JSON.stringify(participantName(plan, id))}, position: ${JSON.stringify(position)}, x: ${x}, y: ${y}}`;
  return substitute ? `{...${created}, isSubstitute: true}` : created;
};
const generateWeeklySource = (plan: WeeklyPlan) => {
  const teams = plan.teams.map((team) => {
    const meta = teamDefinitions[team.id];
    const assignedPosition = new Map<ParticipantId, OutfieldPosition>();
    for (const slot of slots) assignedPosition.set(team.formation[slot], slot);
    const players = team.playerOrder.map((id) => {
      const position = assignedPosition.get(id);
      const fallbackPosition = participantPositions(plan, id)[0] ?? 'CB';
      return position
        ? `        ${playerExpression(plan, id, position, false)},`
        : `        ${playerExpression(plan, id, fallbackPosition, true)},`;
    });
    return `    {
      id: ${JSON.stringify(team.id)},
      name: ${JSON.stringify(meta.name)},
      emoji: ${JSON.stringify(meta.emoji)},
      color: ${JSON.stringify(meta.color)},
      accent: ${JSON.stringify(meta.accent)},
      formationLocked: true,
      players: [
${players.join('\n')}
      ],
    }`;
  });
  const goalkeepers = plan.goalkeepers.map((id) => `    ${playerExpression(plan, id, 'GK', false)},`);
  return `import type {Lineup} from '../types';
import {createLineupPlayer} from './player-registry';

// Generated from an explicitly approved weekly formation plan.
export const weeklyLineup: Lineup = {
  eventTitle: 'כדורגל שישי',
  eventSubtitle: 'חשיפת ההרכבים',
  matchDate: ${JSON.stringify(formatDateForVideo(plan.date))},
  kickoffTime: '08:00',
  temperature: '',
  weatherLabel: '',
  groupIcon: 'private/branding/group-icon.png',
  goalkeepers: [
${goalkeepers.join('\n')}
  ],
  teams: [
${teams.join(',\n')}
  ],
};
`;
};
const writeAtomic = (filePath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, contents);
  fs.renameSync(temporary, filePath);
};

const syncPlayerFolders = () => {
  const playersRoot = path.resolve(projectRoot, 'private-data/assets/players');
  let created = 0;
  for (const [id, profile] of Object.entries(playerRegistry)) {
    const prefix = 'private/players/';
    if (!profile.assetFolder.startsWith(prefix)) {
      fail(`${id} assetFolder must start with ${prefix}`);
    }
    const relativeFolder = profile.assetFolder.slice(prefix.length);
    const target = path.resolve(playersRoot, relativeFolder);
    if (relativeFolder === '' || !target.startsWith(`${playersRoot}${path.sep}`)) {
      fail(`${id} has an unsafe assetFolder: ${profile.assetFolder}`);
    }
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, {recursive: true});
      created += 1;
    }
  }
  console.log(`Player asset folders are ready (${created} created).`);
};

const {command, values} = parseArgs();
if (command === 'sync-player-folders') {
  syncPlayerFolders();
} else if (command === 'plan') {
  const inputPath = values.get('input') ?? fail('plan requires --input <weekly-input.json>');
  const outputPath = values.get('output') ?? fail('plan requires --output <approved-plan.json>');
  const plan = buildPlan(readJson<WeeklyInput>(inputPath));
  writeAtomic(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
  printPlan(plan);
} else if (command === 'show') {
  const planPath = values.get('plan') ?? fail('show requires --plan <plan.json>');
  const plan = readPlan(planPath);
  validatePlan(plan);
  printPlan(plan);
} else if (command === 'apply') {
  const planPath = values.get('plan') ?? fail('apply requires --plan <approved-plan.json>');
  const plan = readPlan(planPath);
  validatePlan(plan);
  const weeklyPath = values.get('weekly-output') ?? path.join(projectRoot, 'private-data/src/weekly-lineup.ts');
  const archivePath = values.get('archive-output') ?? path.join(projectRoot, 'private-data/lineups', `${plan.date}.json`);
  writeAtomic(weeklyPath, generateWeeklySource(plan));
  writeAtomic(archivePath, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`Applied approved formation to ${weeklyPath}`);
  console.log(`Archived approved plan at ${archivePath}`);
} else {
  fail('Usage: npm run weekly -- sync-player-folders | plan --input <input.json> --output <plan.json> | show --plan <plan.json> | apply --plan <plan.json>');
}
