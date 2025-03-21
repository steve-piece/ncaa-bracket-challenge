"use client"

import { useState } from "react"
import { AgentLeaderboard } from "@/components/agent-leaderboard"
import { BracketVisualization } from "@/components/bracket-visualization"
import { RoundSelector } from "@/components/round-selector"
import { AgentSelector } from "@/components/agent-selector"
import { ScoreCard } from "@/components/score-card"
import { useAgentData } from "@/hooks/use-agent-data"
import { animate } from "motion"

export default function BracketDashboard({ initialAgent = "all" }: { initialAgent?: string }) {
  const [selectedRound, setSelectedRound] = useState(1)
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initialAgent ? [initialAgent] : ["all"])
  const { agents, scores, isLoading, error } = useAgentData()

  const rounds = [
    { id: 1, name: "First Round" },
    { id: 2, name: "Second Round" },
    { id: 3, name: "Sweet 16" },
    { id: 4, name: "Elite 8" },
    { id: 5, name: "Final Four" },
    { id: 6, name: "Championship" },
  ]

  if (isLoading)
    return (
      <div className="text-center py-12 font-rajdhani text-xl">
        <div className="inline-block animate-pulse">Loading bracket data...</div>
      </div>
    )

  if (error)
    return <div className="text-center py-12 text-secondary font-rajdhani text-xl">Error loading bracket data</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div
          className="space-y-6"
          ref={(el) => {
            if (el) animate(el, { opacity: [0, 1], y: [20, 0] }, { duration: 0.3 })
          }}
        >
          <AgentLeaderboard agents={agents} />
          <AgentSelector agents={agents} selectedAgents={selectedAgents} onSelectAgents={setSelectedAgents} />
          <ScoreCard rounds={rounds} />
        </div>
      </div>

      <div className="lg:col-span-3">
        <div
          ref={(el) => {
            if (el) animate(el, { opacity: [0, 1] }, { duration: 0.4, delay: 0.1 })
          }}
        >
          <RoundSelector rounds={rounds} selectedRound={selectedRound} onSelectRound={setSelectedRound} />

          <BracketVisualization selectedRound={selectedRound} selectedAgents={selectedAgents} />
        </div>
      </div>
    </div>
  )
}

