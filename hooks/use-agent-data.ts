"use client"

import { useState, useEffect } from "react"
import type { Agent } from "@/types/agent"
import { fetchAgents, fetchScores } from "@/lib/api"

export function useAgentData() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch agents and scores in parallel
        const [agentsData, scoresData] = await Promise.all([fetchAgents(), fetchScores()])

        // Combine the data
        const agentsWithScores = agentsData.map((agent) => ({
          ...agent,
          score: scoresData[agent.id] || 0,
          // For now, we'll estimate correct picks based on score
          // In a real app, this would be calculated from actual results
          correctPicks: Math.floor((scoresData[agent.id] || 0) / 10),
        }))

        setAgents(agentsWithScores)
        setScores(scoresData)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { agents, scores, isLoading, error }
}

