import { NextResponse } from 'next/server'

type ReqBody = {
  prompt: string
}

// NOTE: This route includes a simple mock response so the app works without provider keys.
// If you want to call a real image model, replace the mock block with your provider SDK/API call,
// and securely store keys in Vercel environment variables.

export async function POST(request: Request) {
  try {
    const body: ReqBody = await request.json()
    const { prompt } = body

    // If you have a provider key, implement the real call here.
    // Example placeholder: check process.env.GEMINI_API_KEY (not implemented here).

    // Mock image generation: return a placeholder image URL with the prompt included as a query for debugging
    const placeholderUrl = `https://via.placeholder.com/1600x900.png?text=${encodeURIComponent('Hero+Image')}`
    const alt = `Hero image for: ${prompt.substring(0, 120)}`

    return NextResponse.json({ url: placeholderUrl, alt })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
