"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/types/agent"

interface AgentLeaderboardProps {
  agents: Agent[]
}

export function AgentLeaderboard({ agents }: AgentLeaderboardProps) {
  // Sort agents by score in descending order
  const sortedAgents = [...agents].sort((a, b) => b.score - a.score)

  return (
    <Card className="border border-primary/30 neon-box overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-primary bg-opacity-10">
        <CardTitle className="font-rajdhani text-white">AI AGENT LEADERBOARD</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {sortedAgents.map((agent, index) => (
            <Link href={`/agents/${agent.id}`} key={agent.id} className="block">
              <div
                className="flex items-center justify-between p-2 rounded-md hover:bg-primary/10 transition-all"
                style={{
                  opacity: 0,
                  transform: "translateX(-20px)",
                  animation: `fadeIn 0.3s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="border-2 border-primary/50">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="bg-gradient-primary text-white font-exo">
                        {agent.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="outline"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center p-0 bg-black border border-accent text-accent font-exo"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-exo font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground font-sans">Predictions pending</p>
                  </div>
                </div>
                <div className="text-xl font-bold font-orbitron text-accent">--</div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Card>
  )
}

