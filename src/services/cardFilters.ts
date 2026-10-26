import {BoosterCard} from './scryfall';
import {colorRank} from './poolAnalysis';

export const MULTICOLOR = 'M';
export const COLORLESS = 'C';
export const MAX_CMC_FILTER = 6;

export const CMC_OPTIONS = [1, 2, 3, 4, 5, MAX_CMC_FILTER];

export const RARITIES = [
    {code: 'common', label: 'Comum'},
    {code: 'uncommon', label: 'Incomum'},
    {code: 'rare', label: 'Rara'},
    {code: 'mythic', label: 'Mítica'},
];

export const SORT_OPTIONS = [
    {value: 'color-cmc', label: 'Cor e custo'},
    {value: 'cmc-color', label: 'Custo e cor'},
    {value: 'rarity', label: 'Raridade'},
    {value: 'name', label: 'Nome'},
] as const;

export type SortKey = typeof SORT_OPTIONS[number]['value'];

export type CardFilterState = {
    colors: string[];
    cmcs: number[];
    rarities: string[];
    sort: SortKey;
};

export const EMPTY_FILTERS: CardFilterState = {colors: [], cmcs: [], rarities: [], sort: 'color-cmc'};

const rarityRank = (card: BoosterCard) => {
    const index = RARITIES.findIndex(({code}) => code === card.rarity);
    return index === -1 ? RARITIES.length : RARITIES.length - 1 - index;
};

const cmcBucket = (card: BoosterCard) => Math.min(MAX_CMC_FILTER, Math.floor(card.cmc));

const matchesColor = (card: BoosterCard, colors: string[]) =>
    colors.some((color) => {
        if (color === MULTICOLOR) {
            return card.colors.length > 1;
        }
        if (color === COLORLESS) {
            return !card.colors.length;
        }
        return card.colors.includes(color);
    });

const comparators: Record<SortKey, (a: BoosterCard, b: BoosterCard) => number> = {
    'color-cmc': (a, b) => colorRank(a) - colorRank(b) || a.cmc - b.cmc || a.name.localeCompare(b.name),
    'cmc-color': (a, b) => a.cmc - b.cmc || colorRank(a) - colorRank(b) || a.name.localeCompare(b.name),
    rarity: (a, b) => rarityRank(a) - rarityRank(b) || colorRank(a) - colorRank(b) || a.cmc - b.cmc,
    name: (a, b) => a.name.localeCompare(b.name),
};

export const hasActiveFilters = (filters: CardFilterState) =>
    filters.colors.length > 0 || filters.cmcs.length > 0 || filters.rarities.length > 0;

export const applyCardFilters = <T extends BoosterCard>(cards: T[], filters: CardFilterState) =>
    cards
        .filter((card) =>
            (!filters.colors.length || matchesColor(card, filters.colors)) &&
            (!filters.cmcs.length || filters.cmcs.includes(cmcBucket(card))) &&
            (!filters.rarities.length || filters.rarities.includes(card.rarity))
        )
        .sort(comparators[filters.sort]);
