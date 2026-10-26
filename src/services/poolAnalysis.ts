import {FunctionsHttpError} from '@supabase/supabase-js';
import {BoosterCard} from './scryfall';
import {supabase, Tier} from './supabase';

export const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D', 'E'];

export const TIER_SCORE: Record<Tier, number> = {S: 5, A: 4, B: 3, C: 2, D: 1, E: 0};

const BOMB_TIERS: Tier[] = ['S', 'A'];

const MAX_IMAGE_SIZE = 2048;

export const COLORS = [
    {code: 'W', label: 'Branco'},
    {code: 'U', label: 'Azul'},
    {code: 'B', label: 'Preto'},
    {code: 'R', label: 'Vermelho'},
    {code: 'G', label: 'Verde'},
];

export const SYNERGY_PATTERNS = [
    {label: 'Compra de cartas', pattern: /\bdraws? (a|an|one|two|three|four|x) (additional )?cards?\b/},
    {label: 'Scry', pattern: /\bscry\b/},
    {label: 'Surveil', pattern: /\bsurveil\b/},
    {label: 'Mill', pattern: /\bmills?\b/},
    {label: 'Contadores +1/+1', pattern: /\+1\/\+1 counter/},
    {label: 'Fichas', pattern: /\btokens?\b/},
    {label: 'Sacrifício', pattern: /\bsacrific/},
    {label: 'Remoção', pattern: /\b(destroy|exile) target\b/},
    {label: 'Dano direto', pattern: /\bdeals? (\d+|x) damage\b|\bdeals damage equal\b/},
    {label: 'Ganho de vida', pattern: /\bgains? (\d+|x) life\b|\blifelink\b/},
    {label: 'Descarte', pattern: /\bdiscards?\b/},
    {label: 'Cemitério', pattern: /\bgraveyard\b/},
];

export type RecognizedCard = {
    name: string;
    count: number;
};

export type PoolCard = BoosterCard & {
    count: number;
    tier?: Tier;
};

export type CardGroup = {
    label: string;
    count: number;
    cards: PoolCard[];
};

export type ColorSummary = {
    code: string;
    label: string;
    count: number;
    averageScore?: number;
};

export type PoolAnalysis = {
    cards: PoolCard[];
    unmatched: string[];
    total: number;
    averageScore?: number;
    tiers: CardGroup[];
    bombs: CardGroup[];
    colors: ColorSummary[];
    multicolor: number;
    colorless: number;
    synergies: CardGroup[];
    keywords: CardGroup[];
};

const normalizeName = (name: string) =>
    name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;

const scoresOf = (cards: PoolCard[]) =>
    cards.flatMap(({tier, count}) => (tier ? Array.from({length: count}, () => TIER_SCORE[tier]) : []));

const sumCount = (cards: PoolCard[]) => cards.reduce((sum, card) => sum + card.count, 0);

export const colorRank = (card: BoosterCard) => {
    if (!card.colors.length) {
        return COLORS.length + 1;
    }
    if (card.colors.length > 1) {
        return COLORS.length;
    }
    return COLORS.findIndex(({code}) => code === card.colors[0]);
};

export const sortCards = <T extends BoosterCard>(cards: T[]) =>
    [...cards].sort((a, b) =>
        a.cmc - b.cmc || colorRank(a) - colorRank(b) || a.name.localeCompare(b.name)
    );

export const isCreature = (card: BoosterCard) => card.typeLine.includes('Creature');

export const isLand = (card: BoosterCard) => card.typeLine.includes('Land') && !isCreature(card);

const toGroup = (label: string, cards: PoolCard[]): CardGroup => ({
    label,
    count: sumCount(cards),
    cards: sortCards(cards),
});

export const filterGroupsByColors = (groups: CardGroup[], colors: string[]) => {
    if (!colors.length) {
        return groups;
    }

    return groups
        .map((group) =>
            toGroup(group.label, group.cards.filter((card) => card.colors.every((color) => colors.includes(color))))
        )
        .filter((group) => group.count > 0)
        .sort((a, b) => b.count - a.count);
};

const matchCards = (recognized: RecognizedCard[], setCards: BoosterCard[], tiers: Record<string, Tier>) => {
    const byName = new Map<string, BoosterCard>();
    for (const card of setCards) {
        byName.set(normalizeName(card.name), card);
        for (const faceName of card.name.split(' // ')) {
            byName.set(normalizeName(faceName), card);
        }
    }

    const pool = new Map<string, PoolCard>();
    const unmatched: string[] = [];

    for (const {name, count} of recognized) {
        const card = byName.get(normalizeName(name));
        if (!card) {
            unmatched.push(name);
            continue;
        }
        const copies = Math.max(1, count);
        const existing = pool.get(card.id);
        pool.set(card.id, existing
            ? {...existing, count: existing.count + copies}
            : {...card, count: copies, tier: tiers[card.id]});
    }

    return {cards: [...pool.values()], unmatched};
};

export const analyzePool = (
    recognized: RecognizedCard[],
    setCards: BoosterCard[],
    tiers: Record<string, Tier>,
): PoolAnalysis => {
    const {cards, unmatched} = matchCards(recognized, setCards, tiers);
    const nonLandCards = cards.filter((card) => !isLand(card));

    const bombCards = cards.filter((card) => card.tier && BOMB_TIERS.includes(card.tier));

    const keywordCounts = new Map<string, PoolCard[]>();
    for (const card of cards) {
        for (const keyword of card.keywords) {
            keywordCounts.set(keyword, [...(keywordCounts.get(keyword) ?? []), card]);
        }
    }

    return {
        cards: sortCards(cards),
        unmatched,
        total: sumCount(cards),
        averageScore: average(scoresOf(cards)),
        tiers: [
            ...TIERS.map((tier) => toGroup(`Tier ${tier}`, cards.filter((card) => card.tier === tier))),
            toGroup('Sem tier', cards.filter((card) => !card.tier)),
        ],
        bombs: [
            ...COLORS.map(({code, label}) =>
                toGroup(label, bombCards.filter((card) => card.colors.length === 1 && card.colors[0] === code))
            ),
            toGroup('Multicolor', bombCards.filter((card) => card.colors.length > 1)),
            toGroup('Incolor', bombCards.filter((card) => !card.colors.length)),
        ].filter((group) => group.count > 0),
        colors: COLORS
            .map(({code, label}) => {
                const colorCards = nonLandCards.filter((card) => card.colors.includes(code));
                return {code, label, count: sumCount(colorCards), averageScore: average(scoresOf(colorCards))};
            })
            .sort((a, b) => b.count - a.count),
        multicolor: sumCount(nonLandCards.filter((card) => card.colors.length > 1)),
        colorless: sumCount(nonLandCards.filter((card) => !card.colors.length)),
        synergies: SYNERGY_PATTERNS
            .map(({label, pattern}) =>
                toGroup(label, cards.filter((card) => pattern.test(card.oracleText.toLowerCase())))
            )
            .filter((group) => group.count > 0)
            .sort((a, b) => b.count - a.count),
        keywords: [...keywordCounts.entries()]
            .map(([keyword, keywordCards]) => toGroup(keyword, keywordCards))
            .sort((a, b) => b.count - a.count),
    };
};

export const imageToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Imagem inválida.'));
        };
        image.src = url;
    });

export const recognizePoolCards = async (image: string, setName: string, cardNames: string[]) => {
    const {data, error} = await supabase.functions.invoke<{ cards: RecognizedCard[] }>('analyze-pool', {
        body: {image, setName, cardNames},
    });

    if (error instanceof FunctionsHttpError) {
        const body: { error?: string; detail?: string } | null = await error.context.json().catch(() => null);
        throw new Error(body?.detail ?? body?.error ?? error.message);
    }

    if (error || !data) {
        throw error ?? new Error('Resposta vazia.');
    }

    return data.cards;
};
