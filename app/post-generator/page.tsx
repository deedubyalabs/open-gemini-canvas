"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CopilotChat, useCopilotChatSuggestions } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import {
  Search,
  Sparkles,
  FileText,
  Twitter,
  TrendingUp,
  Send,
  User,
  ExternalLink,
  Globe,
  Brain,
  Zap,
  Star,
  ChevronDown,
  Check,
  Recycle,
  TreePalm,
  Newspaper,
  Edit,
  Building2Icon,
  Sprout,
  Info,
  Facebook,
  Linkedin,
  Rss
} from "lucide-react"
import { useCoAgent, useCoAgentStateRender, useCopilotAction, useCopilotChat } from "@copilotkit/react-core"
import { ToolLogs } from "@/components/ui/tool-logs"
import { XPost, XPostPreview, XPostCompact } from "@/components/ui/x-post"
import { LinkedInPost, LinkedInPostPreview, LinkedInPostCompact } from "@/components/ui/linkedin-post"
import { FacebookPost, FacebookPostPreview, FacebookPostCompact } from "@/components/ui/facebook-post"
import BlogPost, { BlogPostCompact } from "@/components/ui/blog-post"
import { Button } from "@/components/ui/button"
import { initialPrompt, suggestionPrompt } from "../prompts/prompts"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useLayout } from "../contexts/LayoutContext"


const agents = [
  {
    id: "post_generation_agent",
    name: "Post Generator",
    description: "Generate posts for Linkedin and X with Gemini and Google web search",
    icon: Search,
    gradient: "from-blue-500 to-purple-600",
    active: true,
  },
]

const quickActions = [
  { label: "Greener Grass News", icon: Building2Icon, color: "text-green-600", prompt: "Generate a compelling post about the latest company news" },
  { label: "Greener Grass Services", icon: Sprout, color: "text-green-600", prompt: "Generate a compelling post about one of the services we offer" },
  { label: "Organic Lawn Care", icon: Recycle, color: "text-green-600", prompt: "Generate a compelling post on organic lawn care" },
  { label: "Insights & Tips", icon: Info, color: "text-green-600", prompt: "Generate a compelling post discussing insights and tips for organic lawn care" },
]

interface PostInterface {
  tweet: {
    title: string
    content: string
  }
  linkedIn: {
    title: string
    content: string
  }
  facebook?: {
    title: string
    content: string
  }
  blog?: {
    title: string
    content: string
    author?: string
    date?: string
    category?: string
    image?: string
    image_generation?: string
  }
}


export default function PostGenerator() {
  const router = useRouter()
  const { updateLayout } = useLayout()
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [showColumns, setShowColumns] = useState(false)
  const [posts, setPosts] = useState<PostInterface>({ tweet: { title: "", content: "" }, linkedIn: { title: "", content: "" } })
  const [isAgentActive, setIsAgentActive] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // canvas view state: 'linkedin', 'x', 'blog', 'facebook'
  const [canvasView, setCanvasView] = useState<'linkedin' | 'x' | 'blog' | 'facebook'>('linkedin')
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false)
  const { setState, running } = useCoAgent({
    name: "post_generation_agent",
    initialState: {
      tool_logs: []
    }
  })

  const { appendMessage, setMessages } = useCopilotChat()

  useCoAgentStateRender({
    name: "post_generation_agent",
    render: (state) => {
      return <ToolLogs logs={state?.state?.tool_logs || []} />
    }
  })

  useCopilotAction({
    name: "generate_post",
    description: "Render a post",
    parameters: [
      {
        name: "tweet",
        type: "object",
        description: "The tweet to be rendered",
        attributes: [
          { name: "title", type: "string", description: "The title of the post" },
          { name: "content", type: "string", description: "The content of the post" },
        ],
      },
      {
        name: "linkedIn",
        type: "object",
        description: "The linkedIn post to be rendered",
        attributes: [
          { name: "title", type: "string", description: "The title of the post" },
          { name: "content", type: "string", description: "The content of the post" },
        ],
      },
      {
        name: "facebook",
        type: "object",
        description: "A facebook post to be rendered",
        attributes: [
          { name: "title", type: "string", description: "Facebook title" },
          { name: "content", type: "string", description: "Facebook content" },
        ],
      },
      {
        name: "blog",
        type: "object",
        description: "A blog post to be rendered in the canvas",
        attributes: [
          { name: "title", type: "string", description: "Blog title" },
          { name: "content", type: "string", description: "Blog content (markdown or plain)" },
          { name: "author", type: "string", description: "Author name" },
          { name: "date", type: "string", description: "Publication date" },
          { name: "category", type: "string", description: "Category" },
          { name: "image", type: "string", description: "Image URL" },
          { name: "image_generation", type: "string", description: "Optimized image generation prompt" },
        ],
      },
    ],
    render: ({ args }) => {
      useEffect(() => {
        console.log("Rendering posts with args:", args)
        // console.log(posts.linkedIn.content == '')
      }, [args])
      return <>
        {args.tweet?.content != '' && <div className="px-2 mb-3">
          <XPostCompact title={args.tweet?.title || ""} content={args.tweet?.content || ""} />
        </div>}
        {args.linkedIn?.content != '' && <div className="px-2 mb-3">
          <LinkedInPostCompact title={args.linkedIn?.title || ""} content={args.linkedIn?.content || ""} />
        </div>}
        {args.facebook?.content != '' && <div className="px-2 mb-3">
          <FacebookPostCompact title={args.facebook?.title || ""} content={args.facebook?.content || ""} />
        </div>}
        {args.blog?.content != '' && <div className="px-2">
          <BlogPostCompact title={args.blog?.title || ""} content={args.blog?.content || ""} />
        </div>}
      </>
    },
    handler: (args) => {
      console.log(args, "args")
      setShowColumns(true)

      // Try to attach an image to the blog post. Prefer a local public image
      // (from /public) based on keywords. If none found and an optimized
      // `image_generation` prompt exists, call the image generation API.
      const attachImage = async (): Promise<typeof args.blog> => {
        let blog = args.blog
        try {
          // helper to choose a public image from the `public/` folder
          const choosePublicImage = (b: any): string | undefined => {
            if (!b) return undefined
            const text = `${b.title || ''} ${b.content || ''} ${b.category || ''}`.toLowerCase()

            const mappings: { keywords: string[]; file: string }[] = [
              { keywords: ['aeration'], file: '/aeration.png' },
              { keywords: ['fertil', 'fertilization'], file: '/fertilization.png' },
              { keywords: ['flea', 'tick'], file: '/flea-tick-control.png' },
              { keywords: ['grub', 'insect'], file: '/grub-insect-control.png' },
              { keywords: ['mosquito'], file: '/mosquito-control.png' },
              { keywords: ['overseed', 'overseeding'], file: '/overseeding.png' },
              { keywords: ['pest', 'pest-control'], file: '/pest-control.png' },
              { keywords: ['pre-emergent', 'crabgrass'], file: '/pre-emergent-crabgrass.png' },
              { keywords: ['weed', 'weed-control'], file: '/weed-control.png' },
              { keywords: ['lawn', 'grass'], file: '/general.png' },
            ]

            for (const m of mappings) {
              for (const k of m.keywords) {
                if (text.includes(k)) return m.file
              }
            }

            // Default fallback image
            return '/general.png'
          }

          // If there's no image provided, try to pick a public one
          if (!blog?.image) {
            const publicImg = choosePublicImage(blog)
            if (publicImg) {
              blog = { ...blog, image: publicImg }
            }
          }

          // If we still don't have an image, fall back to the image-generation API
          if (!blog?.image && blog?.image_generation) {
            const res = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: blog.image_generation })
            })
            const data = await res.json()
            if (data?.url) {
              blog = { ...blog, image: data.url }
            }
          }
        } catch (err) {
          console.error('Image generation failed', err)
        }

        return blog
      }

      // Attach image (async) and then update state with the resulting blog
      attachImage().then((updatedBlog) => {
        setPosts({ tweet: args.tweet, linkedIn: args.linkedIn, facebook: args.facebook, blog: updatedBlog })
      })
      attachImage()
      setState((prevState) => ({
        ...prevState,
        tool_logs: []
      }))
    }
  })

  useCopilotChatSuggestions({
    available: "enabled",
    instructions: suggestionPrompt,
  })


  return (
    <div className="flex h-screen bg-zinc-200 overflow-hidden">
      {/* Chat Column (approx 2/5) */}
      <div className="flex flex-col min-h-screen w-2/5 bg-white backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
        {/* Header */}
        <div className="h-40 p-4 border-b border-gray-100/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-black bg-clip-text text-transparent">
                  Greener Grass Content Generation Suite
                </h1>
              </div>
            </div>

            {/* Live Research badge on the right */}
            <div className="flex items-center">
              {running && (
                <Badge className="bg-green-100 text-green-700 border border-green-700">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-700 mr-2 animate-pulse" />
                  Live Research
                </Badge>
              )}
            </div>
          </div>
        </div>


        <div className="flex-1 overflow-auto">

          {/* Chat Input at Bottom */}
          <CopilotChat
            className="h-full p-2"
            Input={({ onSend, inProgress }) => {
              const [input, setInput] = useState("")
              return (
                <div className="space-y-3">
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (input.trim() === "") return
                      onSend(input)
                      setInput("")
                    }}
                  >
                    <div className="relative">
                      <Textarea
                        value={input}
                        onKeyDown={(e) => {
                          if (e.key.toLowerCase() === 'enter' && !inProgress) {
                            onSend(input)
                            setInput("")
                          }
                        }}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[104px] resize-none rounded-xl border-muted-foreground/20 p-4 pl-4 pr-28 pb-10"
                      />

                      {/* Social preview icons moved to bottom-right, immediately left of send icon */}
                      <div className="absolute right-12 bottom-3 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Preview LinkedIn"
                          title="LinkedIn preview"
                          onClick={() => setCanvasView('linkedin')}
                          className={cn("w-8 h-8 rounded-md flex items-center justify-center", canvasView === 'linkedin' ? 'bg-gray-100' : 'hover:bg-gray-100')}
                        >
                          <Linkedin className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          aria-label="Preview X"
                          title="X (Twitter) preview"
                          onClick={() => setCanvasView('x')}
                          className={cn("w-8 h-8 rounded-md flex items-center justify-center", canvasView === 'x' ? 'bg-gray-100' : 'hover:bg-gray-100')}
                        >
                          <Twitter className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          aria-label="Preview Facebook"
                          title="Facebook preview"
                          onClick={() => setCanvasView('facebook')}
                          className={cn("w-8 h-8 rounded-md flex items-center justify-center", canvasView === 'facebook' ? 'bg-gray-100' : 'hover:bg-gray-100')}
                        >
                          <Facebook className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          aria-label="Preview Blog"
                          title="Blog preview"
                          onClick={() => setCanvasView('blog')}
                          className={cn("w-8 h-8 rounded-md flex items-center justify-center", canvasView === 'blog' ? 'bg-gray-100' : 'hover:bg-gray-100')}
                        >
                          <Rss className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>

                      {/* Send icon-only button (arrow) at bottom-right */}
                      <button
                        type="button"
                        aria-label="Send message"
                        title="Send"
                        onClick={(e) => {
                          e.preventDefault()
                          if (input.trim() === "") return
                          onSend(input)
                          setInput("")
                        }}
                        className="absolute right-3 bottom-3 text-black hover:text-green-800 focus:outline-none p-1"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Main Content (approx 3/5) */}
      <div className="w-3/5 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {showColumns ? (
            // Render single selected canvas view
            (canvasView === 'linkedin' && (
              <div className="w-full h-full">
                {posts.linkedIn.content ? (
                  <div className="w-full h-full">
                    <LinkedInPostPreview title={posts.linkedIn.title || ""} content={posts.linkedIn.content || ""} />
                  </div>
                ) : <div className="text-center text-gray-500">No LinkedIn content yet.</div>}
              </div>
            )) || (canvasView === 'x' && (
              <div className="w-full h-full">
                {posts.tweet.content ? (
                  <div className="w-full h-full">
                    <XPostPreview title={posts.tweet.title || ""} content={posts.tweet.content || ""} />
                  </div>
                ) : <div className="text-center text-gray-500">No X (Twitter) content yet.</div>}
              </div>
            )) || (canvasView === 'facebook' && (
              <div className="w-full h-full">
                {posts.facebook?.content ? (
                  <div className="w-full h-full">
                    <FacebookPostPreview title={posts.facebook?.title || ""} content={posts.facebook?.content || ""} />
                  </div>
                ) : <div className="text-center text-gray-500">No Facebook content yet.</div>}
              </div>
            )) || (canvasView === 'blog' && (
              <div className="w-full h-full">
                {posts.blog?.content ? (
                  <div className="max-w-3xl mx-auto">
                    <BlogPost
                      title={posts.blog.title || ""}
                      content={posts.blog.content || ""}
                      author={posts.blog.author}
                      date={posts.blog.date}
                      category={posts.blog.category}
                      image={posts.blog.image}
                    />
                    <div className="mt-4 flex gap-2 justify-end">
                      <Button onClick={() => {
                        const saved = JSON.parse(localStorage.getItem('saved_posts_v1') || '[]')
                        saved.unshift({ post: posts, createdAt: new Date().toISOString() })
                        localStorage.setItem('saved_posts_v1', JSON.stringify(saved.slice(0, 50)))
                        alert('Post saved to localStorage')
                      }}>Save Post</Button>
                      <Button variant="outline" onClick={() => router.push('/image-generator')}>Open Image Generator</Button>
                    </div>
                  </div>
                ) : <div className="text-center text-gray-500">No blog content yet.</div>}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="relative mb-8">
              </div>
              <h3 className="text-4xl font-bold bg-black bg-clip-text text-transparent mb-3">
                What do you want to create?
              </h3>
              <p className="text-gray-600 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                Create social media content for Greener Grass with a single prompt.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {quickActions.slice(0, 4).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    disabled={running}

                    className="h-auto p-6 flex flex-col items-center gap-3 bg-white backdrop-blur-sm border-gray-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                    onClick={() => appendMessage(new TextMessage({
                      role: Role.User,
                      content: action.prompt
                    }))}
                  >
                    <action.icon
                      className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform duration-200`}
                    />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
