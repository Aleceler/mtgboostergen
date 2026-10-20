import OpenAI from 'npm:openai@^5';

const MAX_CARD_NAMES = 1000;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const poolSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['cards'],
    properties: {
        cards: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'count'],
                properties: {
                    name: { type: 'string' },
                    count: { type: 'integer' },
                },
            },
        },
    },
};

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

const buildPrompt = (setName: string, cardNames: string[]) => `
Identify every Magic: The Gathering card visible in this image of a sealed pool from the set "${setName}".

Rules:
- Use exactly the card names from the list below when a card matches.
- Count duplicate copies of the same card.
- Ignore cards that are unreadable or not in the list.
- Do not invent names.

Card list:
${cardNames.join('\n')}
`;

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return json({ error: 'Método não permitido.' }, 405);
    }

    const { image, setName, cardNames } = await request.json().catch(() => ({}));

    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return json({ error: 'Imagem inválida.' }, 400);
    }

    const names = Array.isArray(cardNames)
        ? cardNames.filter((name): name is string => typeof name === 'string').slice(0, MAX_CARD_NAMES)
        : [];

    try {
        const response = await openai.responses.create({
            model: 'gpt-5.4-mini',
            input: [
                {
                    role: 'user',
                    content: [
                        { type: 'input_text', text: buildPrompt(typeof setName === 'string' ? setName : '', names) },
                        { type: 'input_image', image_url: image, detail: 'high' },
                    ],
                },
            ],
            text: {
                format: { type: 'json_schema', name: 'pool_cards', strict: true, schema: poolSchema },
            },
        });

        return json(JSON.parse(response.output_text));
    } catch (error) {
        console.error(error);
        return json({
            error: 'Falha ao analisar a imagem.',
            detail: error instanceof Error ? error.message : String(error),
        }, 502);
    }
});
