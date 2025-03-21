"use client"

import { useState, useEffect } from "react"
import type { Match } from "@/types/match"
import { fetchBracketData } from "@/lib/api"

export function useBracketData(round: number, agentIds: string[]) {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchBracketData(round, agentIds)
        setMatches(data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setIsLoading(false)
      }
    }

    fetchData()
  }, [round, agentIds])

  return { matches, isLoading, error }
}

