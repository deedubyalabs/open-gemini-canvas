import React from 'react'
import { format } from 'date-fns'
import { User } from 'lucide-react'

// Very small markdown-ish renderer supporting:
// - #, ## headings
// - unordered lists starting with '-' or '*'
// - ordered lists starting with '1.'
// - blockquotes starting with '>'
// - paragraphs separated by blank lines
function renderRichContent(content: string) {
  if (!content) return null

  // Normalize line endings
  const lines = content.replace(/\r\n/g, '\n').split('\n')

  const blocks: Array<{ type: string; lines: string[] }> = []
  let buffer: string[] = []
  let bufferType = 'p'

  const flush = () => {
    if (buffer.length === 0) return
    blocks.push({ type: bufferType, lines: buffer })
    buffer = []
    bufferType = 'p'
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()
    if (line === '') {
      flush()
      continue
    }

    // Heading 1
    if (/^#\s+/.test(line)) {
      flush()
      blocks.push({ type: 'h1', lines: [line.replace(/^#\s+/, '')] })
      continue
    }
    // Heading 2
    if (/^##\s+/.test(line)) {
      flush()
      blocks.push({ type: 'h2', lines: [line.replace(/^##\s+/, '')] })
      continue
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      // if previous buffer is quote, append
      if (bufferType !== 'blockquote') flush()
      bufferType = 'blockquote'
      buffer.push(line.replace(/^>\s?/, ''))
      continue
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      if (bufferType !== 'ul') flush()
      bufferType = 'ul'
      buffer.push(line.replace(/^[-*]\s+/, ''))
      continue
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (bufferType !== 'ol') flush()
      bufferType = 'ol'
      buffer.push(line.replace(/^\d+\.\s+/, ''))
      continue
    }

    // default paragraph text
    if (bufferType !== 'p') flush()
    bufferType = 'p'
    buffer.push(line)
  }
  flush()

  // Map blocks to React nodes
  return blocks.map((block, idx) => {
    const key = `block-${idx}`
    switch (block.type) {
      case 'h1':
        return <h2 key={key} className="text-3xl font-extrabold mt-6 mb-4">{block.lines.join('\n')}</h2>
      case 'h2':
        return <h3 key={key} className="text-2xl font-bold mt-5 mb-3">{block.lines.join('\n')}</h3>
      case 'blockquote':
        return (
          <blockquote key={key} className="border-l-4 border-gray-200 pl-4 italic text-gray-700 my-4">
            {block.lines.map((l, i) => <p key={i} className="mb-1">{l}</p>)}
          </blockquote>
        )
      case 'ul':
        return (
          <ul key={key} className="list-disc list-inside ml-4 my-3 text-gray-800">
            {block.lines.map((l, i) => <li key={i} className="mb-1">{l}</li>)}
          </ul>
        )
      case 'ol':
        return (
          <ol key={key} className="list-decimal list-inside ml-4 my-3 text-gray-800">
            {block.lines.map((l, i) => <li key={i} className="mb-1">{l}</li>)}
          </ol>
        )
      default:
        return (
          <div key={key} className="text-base text-gray-800 leading-relaxed my-3">
            {block.lines.map((l, i) => <p key={i} className="mb-3">{l}</p>)}
          </div>
        )
    }
  })
}

interface BlogProps {
  title: string
  content: string
  author?: string
  date?: string | Date
  category?: string
  image?: string
}

export function BlogPostCompact({ title, content }: BlogProps) {
  return (
    <div className="p-3 rounded-md bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm">
      <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      <p className="text-xs text-gray-600 mt-1 line-clamp-3">{content}</p>
    </div>
  )
}

export default function BlogPost({ title, content, author = 'Greener Grass', date, category = 'Uncategorized', image }: BlogProps) {
  const dateObj = date ? new Date(date) : new Date()
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Hero */}
      {image ? (
        <div className="w-full h-72 bg-gray-100">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-center">
          <div className="w-28 h-28 rounded-lg bg-white/60 flex items-center justify-center shadow-inner">
            <User className="w-12 h-12 text-green-600" />
          </div>
        </div>
      )}

      <div className="p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-sm text-green-600 font-medium mb-1">{category}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">{title}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700">{author}</div>
            <div className="text-xs text-gray-500">{format(dateObj, 'PPP')}</div>
          </div>
        </div>

        <div className="prose max-w-none">
          {renderRichContent(content || '')}
        </div>
      </div>
    </article>
  )
}
