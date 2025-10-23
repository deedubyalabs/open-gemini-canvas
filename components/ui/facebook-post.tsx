"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Calendar,
  MapPin,
  ThumbsUp
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface FacebookPostProps {
  title: string
  content: string
  className?: string
}

export function FacebookPost({
  title,
  content,
  className,
}: FacebookPostProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Default values for demo purposes
  const defaultAuthor = {
    name: "Greener Grass Organic Lawn & Pest",
    title: "The Healthy Lawn You've Always Wanted - Without All The Chemicals",
    avatar: "/greener-grass-logo.jpeg",
    verified: true,
  }

  const defaultTimestamp = "2h ago"
  const defaultLocation = "Canton, OH"
  const defaultLikes = 1247
  const defaultComments = 89
  const defaultShares = 23

  return (
    <Card className={cn("w-full bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={defaultAuthor.avatar} alt={defaultAuthor.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-700 to-blue-800 text-white font-semibold">
              {defaultAuthor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {defaultAuthor.name}
              </span>
              {defaultAuthor.verified && (
                <div className="w-4 h-4 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-gray-600 text-xs mb-1">
              <div>{defaultAuthor.title}</div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{defaultTimestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{defaultLocation}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Title */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-base">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-3 h-3 text-white" />
              </div>
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
            <span>{formatNumber(defaultLikes)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{formatNumber(defaultComments)} comments</span>
            <span>{formatNumber(defaultShares)} shares</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comment</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <Share className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Facebook Logo Component
export function FacebookLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
        </svg>
      </div>
      <span className="font-bold text-xl text-blue-700">Facebook</span>
    </div>
  )
}

// Facebook Post Preview Component (for the canvas)
export function FacebookPostPreview({title, content}: {title: string, content: string}) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center ml-4 mb-4">
        <FacebookLogo />
        <Badge variant="outline" className="text-xs ml-2">
          Preview
        </Badge>
      </div>
      
      <div className="flex-1 w-full">
        <FacebookPost title={title} content={content} />
      </div>
    </div>
  )
}

// Compact Facebook Post Component (for chat UI)
export function FacebookPostCompact({
  title,
  content,
  className,
}: FacebookPostProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const defaultAuthor = {
    name: "Greener Grass Organic Lawn & Pest",
    avatar: "/greener-grass-logo.jpeg",
    verified: true,
  }

  const defaultTimestamp = "2h ago"
  const defaultLocation = "Canton, OH"
  const defaultLikes = 1247
  const defaultComments = 89
  const defaultShares = 23

  return (
    <Card className={cn("w-full max-w-sm bg-white border border-gray-200/50 shadow-sm", className)} style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={defaultAuthor.avatar} alt={defaultAuthor.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-700 to-blue-800 text-white text-xs font-semibold">
              {defaultAuthor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-semibold text-gray-900 text-xs truncate">
                {defaultAuthor.name}
              </span>
              {defaultAuthor.verified && (
                <div className="w-3 h-3 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-gray-600 text-xs mb-1">
              <div>{defaultAuthor.name}</div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-2 h-2" />
                <span>{defaultTimestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-2 h-2" />
                <span>{defaultLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="mb-2">
          <p className="text-gray-900 text-xs leading-relaxed whitespace-pre-wrap overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {content}
          </p>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between py-1 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-2 h-2 text-white" />
              </div>
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-2 h-2 text-white" />
              </div>
            </div>
            <span>{formatNumber(defaultLikes)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{formatNumber(defaultComments)} comments</span>
            <span>{formatNumber(defaultShares)} shares</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-11 pt-1 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex items-center gap-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 h-6 px-2"
          >
            <ThumbsUp className="w-2 h-2" />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex items-center gap-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 h-6 px-2"
          >
            <MessageCircle className="w-2 h-2" />
            <span className="text-xs">Comment</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex items-center gap-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 h-6 px-2"
          >
            <Share className="w-2 h-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
