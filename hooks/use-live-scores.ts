"use client"

import { useState, useEffect } from "react"
import type { Match } from "@/types/match"

export function useLiveScores(matches: Match[], refreshInterval = 60000) {
  const [liveMatches, setLiveMatches] = useState<Match[]>(matches)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    // Initialize with the provided matches
    setLiveMatches(matches)

    // Function to fetch updated scores
    const fetchScores = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get the round from the first match
        const round = matches.length > 0 ? matches[0].round : 1

        const response = await fetch(`/api/scores?round=${round}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.matches) {
          setLiveMatches(data.matches)
          setIsMockData(data._mock || false)
          setApiAvailable(data._apiAvailable !== undefined ? data._apiAvailable : null)
          setLastUpdated(new Date())
          setRetryCount(0) // Reset retry count on success
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching live scores:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setIsLoading(false)

        // Increment retry count
        setRetryCount((prev) => prev + 1)

        // On error, keep using the existing matches
        // This ensures the UI doesn't break if the API fails
      }
    }

    // Fetch scores immediately
    fetchScores()

    // Set up interval to refresh scores, with exponential backoff on errors
    const intervalTime =
      retryCount > 0
        ? Math.min(refreshInterval * Math.pow(2, retryCount), 300000) // Max 5 minutes
        : refreshInterval

    const intervalId = setInterval(fetchScores, intervalTime)

    // If we've reached max retries, stop trying so frequently
    if (retryCount >= MAX_RETRIES) {
      console.log(`Reached max retries (${MAX_RETRIES}), reducing refresh frequency`)
    }

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [matches, refreshInterval, retryCount])

  return {
    matches: liveMatches,
    isLoading,
    error,
    isMockData,
    apiAvailable,
    lastUpdated,
    retryCount,
  }
}

