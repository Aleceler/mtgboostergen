import {COLORS, isCreature, isLand, PoolCard, sortCards, SYNERGY_PATTERNS, TIER_SCORE} from './poolAnalysis';

export type DeckCategory = 'creature' | 'removal' | 'trick' | 'other';

type SlotCategory = Exclude<DeckCategory, 'other'>;

export const DECK_SLOTS: Record<SlotCategory, { min: number; max: number }> = {
    creature: {min: 14, max: 16},
    removal: {min: 4, max: 6},
    trick: {min: 2, max: 3},
};

const SLOT_LABELS: Record<SlotCategory, string> = {
    creature: 'criaturas',
    removal: 'remoções',
    trick: 'truques/compra',
};

const DECK_SIZE = 40;
const DEFAULT_LANDS = 17;
const LOW_CURVE_LANDS = 16;
const LOW_CURVE_AVERAGE_CMC = 2.75;
const UNTIERED_SCORE = 1.5;
const EXPENSIVE_CMC = 6;
const EXPENSIVE_PENALTY = 0.5;
const SYNERGY_STEP = 0.1;
const MAX_SYNERGY_PER_TAG = 4;
const MAX_SYNERGY_BONUS = 1;
const SPLASH_MIN_SCORE = TIER_SCORE.A;
const SPLASH_PENALTY = 0.5;
const MAX_SPLASH_CARDS = 3;
const MIN_SPLASH_SOURCES = 3;
const MAX_NONBASIC_LANDS = 3;
const MISSING_SLOT_PENALTY = 3;
const TWO_COLOR_SUGGESTIONS = 2;
const SPLASH_BASE_CANDIDATES = 3;
const MIN_DECK_SYNERGY = 3;
const MAX_DECK_SYNERGIES = 6;

const REMOVAL_PATTERNS = [
    /\b(destroy|exile) (up to \w+ )?(another )?target (?!cards?\b)/,
    /\bdestroy all\b/,
    /\bdeals? (\d+|x) damage to (any target|target|each creature|each other creature)/,
    /\bdeals damage equal to [^.]* to (any target|target)/,
    /\bfights? (up to one )?(another )?target\b/,
    /\b(target|each) (opponent|player) sacrifices\b/,
    /\bgets? -(\d+|x)\/-(\d+|x)\b/,
];

const TRICK_PATTERNS = [
    /\bgets? \+(\d+|x)\/\+(\d+|x) until end of turn\b/,
    /\b\+1\/\+1 counters? on (target|up to|each creature you control)/,
    /\bgains? (indestructible|hexproof|first strike|double strike|trample|flying|lifelink|deathtouch|vigilance|menace)\b[^.]*until end of turn\b/,
    /\bdraws? (a|an|one|two|three|x) cards?\b/,
];

export type DeckSuggestion = {
    id: string;
    colors: string[];
    splash?: string;
    creatures: PoolCard[];
    removal: PoolCard[];
    tricks: PoolCard[];
    others: PoolCard[];
    nonbasicLands: PoolCard[];
    basicLands: { code: string; count: number }[];
    spellCount: number;
    landCount: number;
    averageScore?: number;
    curve: { label: string; count: number }[];
    synergies: { label: string; count: number }[];
    warnings: string[];
    score: number;
};

type Unit = {
    card: PoolCard;
    score: number;
    category: DeckCategory;
    splash: boolean;
};

export const categorize = (card: PoolCard): DeckCategory => {
    if (isCreature(card)) {
        return 'creature';
    }
    const text = card.oracleText.toLowerCase();
    if (REMOVAL_PATTERNS.some((pattern) => pattern.test(text))) {
        return 'removal';
    }
    if (TRICK_PATTERNS.some((pattern) => pattern.test(text))) {
        return 'trick';
    }
    return 'other';
};

const cardTags = (card: PoolCard) => {
    const text = card.oracleText.toLowerCase();
    return [
        ...card.keywords,
        ...SYNERGY_PATTERNS.filter(({pattern}) => pattern.test(text)).map(({label}) => label),
    ];
};

const baseScore = (card: PoolCard) =>
    (card.tier ? TIER_SCORE[card.tier] : UNTIERED_SCORE) - (card.cmc >= EXPENSIVE_CMC ? EXPENSIVE_PENALTY : 0);

const countPips = (manaCost: string, color: string) =>
    (manaCost.match(new RegExp(`\\{[^}]*${color}[^}]*\\}`, 'g')) ?? []).length;

const distribute = (total: number, weights: { code: string; weight: number }[]) => {
    const weightSum = weights.reduce((sum, {weight}) => sum + weight, 0);
    const normalized = weightSum ? weights : weights.map(({code}) => ({code, weight: 1}));
    const normalizedSum = weightSum || weights.length;
    const shares = normalized.map(({code, weight}) => {
        const exact = (total * weight) / normalizedSum;
        return {code, count: Math.floor(exact), remainder: exact - Math.floor(exact)};
    });
    let left = total - shares.reduce((sum, share) => sum + share.count, 0);
    for (const share of [...shares].sort((a, b) => b.remainder - a.remainder)) {
        if (left <= 0) {
            break;
        }
        share.count++;
        left--;
    }
    return shares.map(({code, count}) => ({code, count}));
};

const groupUnits = (units: Unit[]) => {
    const grouped = new Map<string, PoolCard>();
    for (const {card} of units) {
        const existing = grouped.get(card.id);
        grouped.set(card.id, existing ? {...existing, count: existing.count + 1} : {...card, count: 1});
    }
    return sortCards([...grouped.values()]);
};

const selectSpells = (units: Unit[], target: number) => {
    const sorted = [...units].sort((a, b) => b.score - a.score);
    const picked: Unit[] = [];
    const taken = new Set<Unit>();
    const counts: Record<DeckCategory, number> = {creature: 0, removal: 0, trick: 0, other: 0};
    let splashCount = 0;

    const canTake = (unit: Unit, ignoreMax: boolean) =>
        !taken.has(unit) &&
        (!unit.splash || splashCount < MAX_SPLASH_CARDS) &&
        (ignoreMax || unit.category === 'other' || counts[unit.category] < DECK_SLOTS[unit.category].max);

    const take = (unit: Unit) => {
        taken.add(unit);
        picked.push(unit);
        counts[unit.category]++;
        if (unit.splash) {
            splashCount++;
        }
    };

    for (const category of ['removal', 'creature', 'trick'] as SlotCategory[]) {
        for (const unit of sorted) {
            if (counts[category] >= DECK_SLOTS[category].min || picked.length >= target) {
                break;
            }
            if (unit.category === category && canTake(unit, false)) {
                take(unit);
            }
        }
    }

    for (const ignoreMax of [false, true]) {
        for (const unit of sorted) {
            if (picked.length >= target) {
                break;
            }
            if (canTake(unit, ignoreMax)) {
                take(unit);
            }
        }
    }

    return {picked, counts};
};

const buildDeck = (pool: PoolCard[], colors: string[], splash?: string): DeckSuggestion | undefined => {
    const allowed = splash ? [...colors, splash] : colors;
    const fits = (card: PoolCard) => card.colors.every((color) => allowed.includes(color));
    const candidates = pool.filter((card) => !isLand(card) && fits(card));

    const tagCounts = new Map<string, number>();
    for (const card of candidates) {
        for (const tag of cardTags(card)) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + card.count);
        }
    }

    const units: Unit[] = candidates.flatMap((card) => {
        const isSplash = !!splash && card.colors.includes(splash);
        const base = baseScore(card);
        if (isSplash && base < SPLASH_MIN_SCORE) {
            return [];
        }
        const synergy = Math.min(
            MAX_SYNERGY_BONUS,
            cardTags(card).reduce((sum, tag) =>
                sum + Math.min(Math.max(0, (tagCounts.get(tag) ?? 0) - card.count), MAX_SYNERGY_PER_TAG) * SYNERGY_STEP, 0),
        );
        const score = base + synergy - (isSplash ? SPLASH_PENALTY : 0);
        return Array.from({length: card.count}, () => ({card, score, category: categorize(card), splash: isSplash}));
    });

    let landCount = DEFAULT_LANDS;
    let {picked, counts} = selectSpells(units, DECK_SIZE - landCount);
    const averageCmc = picked.reduce((sum, unit) => sum + unit.card.cmc, 0) / (picked.length || 1);

    if (averageCmc < LOW_CURVE_AVERAGE_CMC && units.length > picked.length) {
        landCount = LOW_CURVE_LANDS;
        ({picked, counts} = selectSpells(units, DECK_SIZE - landCount));
    }

    if (!picked.length || (splash && !picked.some((unit) => unit.splash))) {
        return undefined;
    }

    const spellTarget = DECK_SIZE - landCount;
    const warnings: string[] = [];
    let missingSlots = 0;
    for (const category of Object.keys(DECK_SLOTS) as SlotCategory[]) {
        const {min, max} = DECK_SLOTS[category];
        if (counts[category] < min) {
            missingSlots += min - counts[category];
            warnings.push(`Só ${counts[category]} ${SLOT_LABELS[category]} nessas cores (ideal ${min} a ${max}).`);
        }
    }
    if (picked.length < spellTarget) {
        warnings.push(`Faltam ${spellTarget - picked.length} cartas jogáveis nessas cores.`);
    }

    const nonbasicLands: PoolCard[] = [];
    let nonbasicCount = 0;
    const landCandidates = pool
        .filter((card) => isLand(card) && !card.typeLine.includes('Basic'))
        .filter((card) => {
            const produced = card.producedMana.filter((color) => color !== 'C');
            return produced.length >= 2 && produced.every((color) => allowed.includes(color));
        })
        .sort((a, b) => baseScore(b) - baseScore(a));
    for (const land of landCandidates) {
        const copies = Math.min(land.count, MAX_NONBASIC_LANDS - nonbasicCount);
        if (copies <= 0) {
            break;
        }
        nonbasicLands.push({...land, count: copies});
        nonbasicCount += copies;
    }

    const basicTotal = landCount - nonbasicCount;
    const pips = (color: string) => picked.reduce((sum, unit) => sum + countPips(unit.card.manaCost, color), 0);
    let basicLands: { code: string; count: number }[];

    if (splash) {
        const splashSources = nonbasicLands
            .filter((land) => land.producedMana.includes(splash))
            .reduce((sum, land) => sum + land.count, 0);
        const splashBasics = Math.min(basicTotal, Math.max(0, MIN_SPLASH_SOURCES - splashSources));
        basicLands = [
            ...distribute(basicTotal - splashBasics, colors.map((code) => ({code, weight: pips(code)}))),
            {code: splash, count: splashBasics},
        ];
    } else {
        basicLands = distribute(basicTotal, colors.map((code) => ({code, weight: pips(code)})));
    }

    const deckTagCounts = new Map<string, number>();
    for (const unit of picked) {
        for (const tag of cardTags(unit.card)) {
            deckTagCounts.set(tag, (deckTagCounts.get(tag) ?? 0) + 1);
        }
    }

    const tierScores = picked.flatMap(({card}) => (card.tier ? [TIER_SCORE[card.tier]] : []));
    const byCategory = (category: DeckCategory) => groupUnits(picked.filter((unit) => unit.category === category));

    return {
        id: `${colors.join('')}${splash ? `-${splash}` : ''}`,
        colors,
        splash,
        creatures: byCategory('creature'),
        removal: byCategory('removal'),
        tricks: byCategory('trick'),
        others: byCategory('other'),
        nonbasicLands,
        basicLands: basicLands.filter((basic) => basic.count > 0),
        spellCount: picked.length,
        landCount,
        averageScore: tierScores.length
            ? tierScores.reduce((sum, score) => sum + score, 0) / tierScores.length
            : undefined,
        curve: ['1', '2', '3', '4', '5', '6+'].map((label, index) => ({
            label,
            count: picked.filter((unit) => {
                const cmc = Math.max(1, Math.min(6, Math.floor(unit.card.cmc)));
                return cmc === index + 1;
            }).length,
        })),
        synergies: [...deckTagCounts.entries()]
            .filter(([, count]) => count >= MIN_DECK_SYNERGY)
            .map(([label, count]) => ({label, count}))
            .sort((a, b) => b.count - a.count)
            .slice(0, MAX_DECK_SYNERGIES),
        warnings,
        score: picked.reduce((sum, unit) => sum + unit.score, 0) - missingSlots * MISSING_SLOT_PENALTY,
    };
};

const colorPairs = () =>
    COLORS.flatMap((first, index) => COLORS.slice(index + 1).map((second) => [first.code, second.code]));

export const suggestDecks = (pool: PoolCard[]): DeckSuggestion[] => {
    const twoColorDecks = colorPairs()
        .map((pair) => buildDeck(pool, pair))
        .filter((deck): deck is DeckSuggestion => !!deck)
        .sort((a, b) => b.score - a.score);

    const bestSplash = twoColorDecks
        .slice(0, SPLASH_BASE_CANDIDATES)
        .flatMap((deck) =>
            COLORS
                .filter(({code}) => !deck.colors.includes(code))
                .map(({code}) => buildDeck(pool, deck.colors, code))
        )
        .filter((deck): deck is DeckSuggestion => !!deck)
        .sort((a, b) => b.score - a.score)[0];

    return [...twoColorDecks.slice(0, TWO_COLOR_SUGGESTIONS), ...(bestSplash ? [bestSplash] : [])];
};
