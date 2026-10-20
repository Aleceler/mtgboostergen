import {createClient} from '@supabase/supabase-js';

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

type CardTierRow = {
    card_id: string;
    tier: Tier;
};

export const fetchTiers = async (setCode: string): Promise<Record<string, Tier>> => {
    const {data, error} = await supabase
        .from('card_tiers')
        .select('card_id, tier')
        .eq('set_code', setCode)
        .returns<CardTierRow[]>();

    if (error) {
        throw error;
    }

    return Object.fromEntries(data.map((row) => [row.card_id, row.tier]));
};

export const saveTier = async (setCode: string, cardId: string, tier: Tier) => {
    const {error} = await supabase
        .from('card_tiers')
        .upsert({set_code: setCode, card_id: cardId, tier}, {onConflict: 'user_id,card_id'});

    if (error) {
        throw error;
    }
};

export const removeTier = async (cardId: string) => {
    const {error} = await supabase.from('card_tiers').delete().eq('card_id', cardId);

    if (error) {
        throw error;
    }
};
