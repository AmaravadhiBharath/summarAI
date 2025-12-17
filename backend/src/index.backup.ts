import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { OpenAI } from 'openai'

type Bindings = {
    OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('/*', cors())

app.get('/', (c) => {
    return c.text('Tiger Backend is Running!')
})

app.post('/api/generate', async (c) => {
    const apiKey = c.env.OPENAI_API_KEY
    if (!apiKey) {
        return c.json({ error: 'Server configuration error: API Key missing' }, 500)
    }

    try {
        const body = await c.req.json()
        const { content, options } = body

        // TODO: Add Auth check here (Firebase)
        // TODO: Add Quota check here (DB)

        const openai = new OpenAI({ apiKey })

        const systemPrompt = `
You are Tiger, an advanced summarization engine.
RULES:
1. Compression: Focus on net effect.
2. Voice: Objective, third-person.
3. Format: ${options.format || 'TXT'}
`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Default to mini for now
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            temperature: 0.7,
        })

        return c.json({
            summary: completion.choices[0]?.message?.content || "No summary generated."
        })

    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

export default app
