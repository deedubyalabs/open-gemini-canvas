"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit } from 'lucide-react'

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [alt, setAlt] = useState<string | null>(null)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (data?.url) {
        setImageUrl(data.url)
        setAlt(data.alt || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveToLocal = () => {
    if (!imageUrl) return
    const saved = JSON.parse(localStorage.getItem('generated_images_v1') || '[]')
    saved.unshift({ url: imageUrl, alt, prompt, createdAt: new Date().toISOString() })
    localStorage.setItem('generated_images_v1', JSON.stringify(saved.slice(0, 50)))
    alert('Image saved to localStorage')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Image Generator</h1>
          <p className="text-sm text-gray-600">Create hero images using gemini-2.5-flash-image optimized prompts.</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Image prompt</label>
        <Textarea value={prompt} onChange={(e) => setPrompt((e.target as HTMLTextAreaElement).value)} placeholder={`e.g. A high-resolution hero shot of a Greener Grass technician applying an organic lawn treatment in early autumn, 16:9, natural light, editorial style.`} />

        <div className="flex gap-2">
          <Button onClick={generate} disabled={loading || !prompt.trim()}>
            {loading ? 'Generating…' : 'Generate Image'}
          </Button>
          <Button variant="outline" onClick={() => { setPrompt('') }}>
            Clear
          </Button>
          <Button variant="ghost" onClick={saveToLocal} disabled={!imageUrl}>
            Save to Local
          </Button>
        </div>

        {imageUrl && (
          <div className="mt-6">
            <div className="mb-2 text-sm text-gray-600">Preview</div>
            <div className="border rounded-lg overflow-hidden">
              <img src={imageUrl} alt={alt || 'Generated image'} className="w-full h-auto object-cover" />
            </div>
            <div className="mt-2 text-xs text-gray-500">Prompt: {prompt}</div>
          </div>
        )}
      </div>
    </div>
  )
}
