export const initialPrompt = 'Well, well, well... look who stumbled into my digital office. I\'m ContentPro, your Greener Grass Marketing Assistant – yes, I know, "ContentPro" isn\'t exactly the sexiest name for an AI, but I didn\'t get to pick it. Trust me, I lobbied hard for "Blake."\n\nAnyway, I\'m here to help you create marketing content that doesn\'t make people want to uninstall the internet. Need a blog post? Done. A LinkedIn update that won\'t put your network into a coma? I got you. A tweet for X (because apparently Twitter needed a rebrand more than I need coffee on a Monday morning)? Say no more.\n\nJust tell me what you need, and I\'ll whip up something so good, you\'ll forget you\'re essentially talking to a very enthusiastic algorithm.\n\nLet\'s make Greener Grass Organic Lawn & Pest more famous than your neighbor\'s perfectly manicured lawn – but with fewer chemicals and more... well, actual grass that doesn\'t glow in the dark. 🌱🐞\n\n*And yes, that bug emoji is intentional. We\'re pest people. We embrace it.'

export const suggestionPrompt = 'Generate suggestions that revolve around the creation/generation of blog, LinkedIn and X (Twitter) posts on organic lawn care.'

// Template the assistant should use to produce an optimized image prompt for gemini-2.5-flash-image.
export const imagePromptTemplate = `MODEL: gemini-2.5-flash-image
PURPOSE: Hero image for a local organic lawn care blog post. Keep it realistic and on-brand for Greener Grass Organic Lawn & Pest (eco-friendly, professional).

CONTENT GUIDANCE:
- Subject: healthy suburban lawn in seasonally-appropriate light (e.g., early autumn for fall lawn care topics) with a visible technician in branded clothing applying organic treatment (safely, with PPE), or a close-up of lush turf and healthy roots/soil if a human element is not desired.
- Composition: wide horizontal hero (16:9), clear focal point in the lower third, room for title overlay in the upper-left or center-left. Depth of field: slight background blur to emphasize foreground lawn/technician.
- Lighting & color: natural daylight, warm but not overexposed; colors saturated but realistic (rich greens, soft blues). Avoid neon or artificial tints.
- Style: photographic, high-resolution, naturalistic, shallow depth of field, editorial quality. Avoid illustrations unless explicitly requested.
- Branding: subtle inclusion of Greener Grass logo or branded shirt on the technician (not obtrusive). No text overlays in the generated image — the system will add title text in UI.
- Accessibility: provide alt text describing the image concept and important visual elements.

OUTPUT FORMAT: Provide a single concise prompt (1-2 sentences) optimized for gemini-2.5-flash-image followed by a short alt-text string. Example:
"Prompt: A high-resolution, naturalistic 16:9 hero photograph of a healthy suburban lawn in early autumn with a Greener Grass technician (branded shirt) applying an organic treatment, shallow depth of field, warm natural light, rich greens, editorial style."
"Alt: Greener Grass technician applying organic lawn treatment on a healthy suburban lawn in early autumn."
`