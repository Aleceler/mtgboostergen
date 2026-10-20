const API_URL = 'https://api.scryfall.com';
const PLAY_BOOSTER_SET_TYPES = ['expansion', 'core'];
const REQUEST_DELAY_MS = 100;

export type ScryfallSet = {
    code: string;
    name: string;
    released_at: string;
    set_type: string;
    digital: boolean;
    parent_set_code?: string;
    icon_svg_uri: string;
};

type ScryfallImageUris = {
    normal: string;
};

type ScryfallCardFace = {
    image_uris?: ScryfallImageUris;
    colors?: string[];
    oracle_text?: string;
    mana_cost?: string;
};

type ScryfallCard = {
    id: string;
    name: string;
    rarity: string;
    cmc: number;
    type_line: string;
    colors?: string[];
    oracle_text?: string;
    mana_cost?: string;
    produced_mana?: string[];
    keywords: string[];
    image_uris?: ScryfallImageUris;
    card_faces?: ScryfallCardFace[];
};

type ScryfallList<T> = {
    data: T[];
    has_more: boolean;
    next_page?: string;
};

export type BoosterCard = {
    id: string;
    name: string;
    rarity: string;
    cmc: number;
    typeLine: string;
    colors: string[];
    oracleText: string;
    manaCost: string;
    producedMana: string[];
    keywords: string[];
    imageUrl: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {headers: {Accept: 'application/json'}});
    if (!response.ok) {
        throw new Error(`Scryfall respondeu ${response.status}`);
    }
    return response.json();
};

export const fetchLatestSets = async (limit = 5): Promise<ScryfallSet[]> => {
    const today = new Date().toISOString().slice(0, 10);
    const {data} = await fetchJson<ScryfallList<ScryfallSet>>(`${API_URL}/sets`);

    return data
        .filter((set) =>
            PLAY_BOOSTER_SET_TYPES.includes(set.set_type) &&
            !set.digital &&
            !set.parent_set_code &&
            set.released_at <= today
        )
        .sort((a, b) => b.released_at.localeCompare(a.released_at))
        .slice(0, limit);
};

const toBoosterCard = (card: ScryfallCard): BoosterCard => ({
    id: card.id,
    name: card.name,
    rarity: card.rarity,
    cmc: card.cmc,
    typeLine: card.type_line,
    colors: card.colors ?? [...new Set(card.card_faces?.flatMap((face) => face.colors ?? []) ?? [])],
    oracleText: card.oracle_text ?? card.card_faces?.map((face) => face.oracle_text ?? '').join('\n') ?? '',
    manaCost: card.mana_cost ?? card.card_faces?.map((face) => face.mana_cost ?? '').join('') ?? '',
    producedMana: card.produced_mana ?? [],
    keywords: card.keywords,
    imageUrl: card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? '',
});

const searchCards = async (query: string): Promise<BoosterCard[]> => {
    let url: string | undefined = `${API_URL}/cards/search?q=${encodeURIComponent(query)}&unique=cards`;
    const cards: BoosterCard[] = [];

    while (url) {
        const response = await fetch(url, {headers: {Accept: 'application/json'}});
        if (response.status === 404) {
            return cards;
        }
        if (!response.ok) {
            throw new Error(`Scryfall respondeu ${response.status}`);
        }
        const page: ScryfallList<ScryfallCard> = await response.json();
        cards.push(...page.data.map(toBoosterCard));
        url = page.has_more ? page.next_page : undefined;
        if (url) {
            await wait(REQUEST_DELAY_MS);
        }
    }

    return cards;
};

export const fetchBoosterCards = async (setCode: string): Promise<BoosterCard[]> => {
    const boosterCards = await searchCards(`set:${setCode} game:paper is:booster`);
    if (boosterCards.length) {
        return boosterCards;
    }

    await wait(REQUEST_DELAY_MS);
    return searchCards(`set:${setCode} game:paper -is:promo -t:basic`);
};
