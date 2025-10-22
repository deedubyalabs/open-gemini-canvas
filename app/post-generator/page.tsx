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
  Edit
} from "lucide-react"
import { useCoAgent, useCoAgentStateRender, useCopilotAction, useCopilotChat } from "@copilotkit/react-core"
import { ToolLogs } from "@/components/ui/tool-logs"
import { XPost, XPostPreview, XPostCompact } from "@/components/ui/x-post"
import { LinkedInPost, LinkedInPostPreview, LinkedInPostCompact } from "@/components/ui/linkedin-post"
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
  {
    id: "stack_analysis_agent",
    name: "Stack Analyst",
    description: "Analyze the stack of a Project and generate insights from it",
    icon: FileText,
    gradient: "from-green-500 to-teal-600",
    active: false,
  }
]

const quickActions = [
  { label: "Recent Research", icon: Search, color: "text-green-600", prompt: "Generate a compelling post about recent research on organic lawn care" },
  { label: "Recent News", icon: Newspaper, color: "text-green-600", prompt: "Generate a compelling post about recent news in organic lawn care" },
  { label: "Organic Lawn Care", icon: Recycle, color: "text-green-600", prompt: "Generate a compelling post on organic lawn care tips" },
  { label: "Greener Grass", icon: TreePalm, color: "text-green-600", prompt: "Generate a compelling post about Greener Grass Organic Lawn & Pest" },
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
  // canvas view state: 'linkedin', 'x', 'blog'
  const [canvasView, setCanvasView] = useState<'linkedin' | 'x' | 'blog'>('linkedin')
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false)
  const { setState, running } = useCoAgent({
    name: "post_generation_agent",
    initialState: {
      tool_logs: []
    }
  })

  const { appendMessage, setMessages } = useCopilotChat()


  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // close both dropdowns when clicking outside
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
        setIsViewDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isViewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])


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
        setPosts({ tweet: args.tweet, linkedIn: args.linkedIn, blog })
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Chat Column (approx 2/5) */}
      <div className="flex flex-col min-h-screen w-2/5 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
        {/* Header */}
        <div className="h-40 p-4 border-b border-gray-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Marketing Suite
              </h1>
            </div>
          </div>

          {/* Enhanced Agent Selector */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Active Agent</label>
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-4 pr-8 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm text-sm  transition-all duration-300 shadow-sm hover:shadow-md hover:bg-white/70 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 bg-gradient-to-r ${selectedAgent.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                    <selectedAgent.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{selectedAgent.name}</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-gray-500 transition-transform duration-300",
                    isDropdownOpen && "rotate-180"
                  )} 
                />
              </button>
              
              {/* Dropdown Menu */}
              <div className={cn(
                "absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-xl z-50 transition-all duration-300 transform origin-top",
                isDropdownOpen 
                  ? "opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              )}>
                <div className="p-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                        onClick={() => {
                        if (selectedAgent.id != agent.id) {
                            updateLayout({ agent: agent.id })
                            setMessages([])
                            router.push(`/image-generator`)
                        }
                        setIsDropdownOpen(false)
                      }}
                      className="w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-sm group"
                    >
                      <div className={`w-6 h-6 bg-gradient-to-r ${agent.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                        <agent.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{agent.name}</span>
                          {selectedAgent.id === agent.id && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">{agent.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                      }} className="self-end rounded-xl px-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
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
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-6 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  AI-Powered Editor Canvas
                </h2>
                <p className="text-sm text-gray-600">Powered by Gemini AI & Google Web Search</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAgentActive && <Badge className="bg-green-300 text-green-500 border-0 shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Live Research
              </Badge>}

              {/* Canvas view dropdown (Blog / LinkedIn / X / Both) */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className="flex items-center gap-2 p-2 border border-gray-200/50 rounded-xl bg-white/50 hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {canvasView === 'blog' ? 'Blog' : canvasView === 'x' ? 'X (Twitter)' : 'LinkedIn'}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", isViewDropdownOpen && "rotate-180")} />
                </button>

                <div className={cn(
                  "absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-xl z-50 transition-all duration-200 transform origin-top",
                  isViewDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}>
                  <div className="p-1">
                    <button onClick={() => { setCanvasView('linkedin'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left p-2 rounded-md hover:bg-gray-50", canvasView === 'linkedin' && "bg-blue-50")}>LinkedIn</button>
                    <button onClick={() => { setCanvasView('x'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left p-2 rounded-md hover:bg-gray-50", canvasView === 'x' && "bg-blue-50")}>X (Twitter)</button>
                    <button onClick={() => { setCanvasView('blog'); setIsViewDropdownOpen(false) }} className={cn("w-full text-left p-2 rounded-md hover:bg-gray-50", canvasView === 'blog' && "bg-blue-50")}>Blog</button>
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
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                Your AI Marketing Assistant
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                I can help you create engaging LinkedIn posts, X (Twitter) posts, blog content, and emails.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {quickActions.slice(0, 4).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    disabled={running}

                    className="h-auto p-6 flex flex-col items-center gap-3 bg-white/50 backdrop-blur-sm border-gray-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
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
