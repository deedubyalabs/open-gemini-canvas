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
  Info
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
  { label: "Company News", icon: Building2Icon, color: "text-green-600", prompt: "Generate a compelling post about the latest company news" },
  { label: "Our Services", icon: Sprout, color: "text-green-600", prompt: "Generate a compelling post about one of the services we offer" },
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
          {
            name: "title",
            type: "string",
            description: "The title of the post"
          },
          {
            name: "content",
            type: "string",
            description: "The content of the post"
          }
        ]
      },
      {
        name: "linkedIn",
        type: "object",
        description: "The linkedIn post to be rendered",
        attributes: [
          {
            name: "title",
            type: "string",
            description: "The title of the post"
          },
          {
            name: "content",
            type: "string",
            description: "The content of the post"
          }
        ]
      }
      ,
      {
        name: "facebook",
        type: "object",
        description: "A facebook post to be rendered",
        attributes: [
          { name: "title", type: "string", description: "Facebook title" },
          { name: "content", type: "string", description: "Facebook content" },
        ]
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
        ]
      }
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
      // If the blog includes `image_generation` (optimized prompt), call the image API
      const attachImage = async () => {
        let blog = args.blog
        try {
          if (blog?.image_generation && !blog?.image) {
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
  setPosts({ tweet: args.tweet, linkedIn: args.linkedIn, facebook: args.facebook, blog })
      }
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
          <div className="flex items-center gap-3 mb-4">
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
                Content Generation Suite
              </h1>
            </div>
          </div>
        </div>


        <div className="flex-1 overflow-auto">

          {/* Chat Input at Bottom */}
          <CopilotChat className="h-full p-2" labels={{
            initial: initialPrompt
          }}
            Input={({ onSend, inProgress }) => {
              useEffect(() => {
                if (inProgress) {
                  setIsAgentActive(true)
                } else {
                  setIsAgentActive(false)
                }
              }, [inProgress])
              const [input, setInput] = useState("")
              return (<>
                <div className="space-y-3">
                  <form className="flex flex-col gap-3">
                    <Textarea
                      value={input}
                      onKeyDown={(e) => {
                        if (e.key.toLowerCase() === 'enter' && !inProgress) {
                          appendMessage(new TextMessage({
                            role: Role.User,
                            content: input
                          }))
                        }
                      }}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="min-h-[80px] resize-none rounded-xl border-muted-foreground/20 p-3"
                    />
                    <Button disabled={inProgress}
                      
                      onClick={(e) => {
                        e.preventDefault()
                        if (input.trim() === "") return
                        console.log("sending message")
                        onSend(input)
                        setInput("")
                      }} className="self-end rounded-xl px-5 bg-transparent text-green-700 border border-green-700 hover:bg-green-700 hover:text-white transition-colors duration-200">
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </form>
                </div>
              </>)
            }}
          />
        </div>

      </div>

  {/* Main Content (approx 3/5) */}
  <div className="w-3/5 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 p-6 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-white bg-clip-text text-transparent">
                  Preview Canvas
                </h2>
                <p className="text-sm text-gray-300">Powered by Gemini AI & Google Web Search</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAgentActive && <Badge className="bg-green-100 text-green-500 border-0 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Research
              </Badge>}

              {/* Canvas view dropdown (Blog / LinkedIn / X / Both) */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className="flex items-center gap-2 p-2 border border-gray-200/50 rounded-lg bg-white hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-black">
                    {canvasView === 'blog' ? 'Blog' : canvasView === 'x' ? 'X (Twitter)' : canvasView === 'facebook' ? 'Facebook' : 'LinkedIn'}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", isViewDropdownOpen && "rotate-180")} />
                </button>

                <div className={cn(
                  "absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-xl z-50 transition-all duration-200 transform origin-top",
                  isViewDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}>
                  <div className="p-1">
                    <button onClick={() => { setCanvasView('linkedin'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left text-sm p-2 rounded-md hover:bg-zinc-200", canvasView === 'linkedin' && "text-green-600")}>LinkedIn</button>
                    <button onClick={() => { setCanvasView('x'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left text-sm p-2 rounded-md hover:bg-zinc-200", canvasView === 'x' && "text-green-600")}>X (Twitter)</button>
                    <button onClick={() => { setCanvasView('facebook'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left text-sm p-2 rounded-md hover:bg-zinc-200", canvasView === 'facebook' && "text-green-600")}>Facebook</button>
                    <button onClick={() => { setCanvasView('blog'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left text-sm p-2 rounded-md hover:bg-zinc-200", canvasView === 'blog' && "text-green-600")}>Blog</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
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
