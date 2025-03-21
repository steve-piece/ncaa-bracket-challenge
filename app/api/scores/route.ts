import { NextResponse } from "next/server"
import { fetchGameData, mapSportradarGameToMatch, generateMockGameData, testApiConnection } from "@/lib/sportradar-api"
import { fetchBracketData } from "@/lib/api"
import { shouldFetchGameData, getGameStatus, completedGames, storeCompletedGame } from "@/lib/game-schedule"

// Map our game IDs to Sportradar game IDs
// In a real application, you would store these mappings in a database
const GAME_ID_MAPPING: Record<string, string> = {
  "match-1-1": "95285257-0761-4571-8dcd-040fbf230b91", // Creighton vs Louisville
  "match-1-2": "36813a2c-031e-4528-bdf6-2b5e312b46c1", // High Point vs Purdue
  // First round - Thursday games
  "match-1-3": "a4cd6141-222b-4cd0-b32f-cbe15f5fbb9c", // Montana vs Wisconsin
  "match-1-4": "94f6607f-f2db-492b-acb9-07146f8781f2", // SIU Edwardsville vs Houston
  "match-1-5": "b3098a73-f322-4987-bed2-a08de6030088", // Alabama State vs Auburn
  "match-1-6": "813259f9-d01a-42bd-b957-bf8ef2c377e8", // McNeese vs Clemson
  "match-1-7": "11773774-6849-4b68-8aac-e04695eef2ce", // VCU vs BYU
  "match-1-8": "dac703ed-a894-4604-bb3d-d2b40a552240", // Georgia vs Gonzaga
  "match-1-9": "12b2259d-4ac9-44c1-b01d-ddaedf436936", // Wofford vs Tennessee
  "match-1-10": "c089908c-aa41-4f47-a6e4-dfb174556ddc", // Arkansas vs Kansas
  "match-1-11": "c066781a-6092-4b96-844b-a67da2674f5b", // Yale vs Texas A&M
  "match-1-12": "2171663b-5340-4da8-9b73-fc23bd664cc2", // Drake vs Missouri
  "match-1-13": "dde15af8-3a88-43ff-b00d-3f30359a5c36", // Utah State vs UCLA
  "match-1-14": "15c8d98b-f66d-4d51-a784-dfc9bdeac4c4", // Omaha vs St. John's
  "match-1-15": "2e73d50b-38d3-4fcd-b907-a695699259bd", // UC San Diego vs Michigan
  "match-1-16": "b8e00402-17e0-4720-bec3-307e49249089", // UNC Wilmington vs Texas Tech
  // First round - Friday games
  "match-1-17": "eeae8b31-8665-4b57-9c8d-028b09374e7e", // Baylor vs Mississippi State
  "match-1-18": "733b1fba-e396-4e14-910a-1e201ff95a48", // Robert Morris vs Alabama
  "match-1-19": "e8bf579b-62f5-4fc8-9b27-5ef0ef4a8e4f", // Lipscomb vs Iowa State
  "match-1-20": "e858f388-bb1c-4f58-8fb3-8faf93f61a35", // Colorado State vs Memphis
  "match-1-21": "3a98d5a7-4b11-4342-b12a-9b623fab534e", // Mount St. Mary's vs Duke
  "match-1-22": "8ecec46a-9c15-4bf6-9596-dc4002ad46ba", // Vanderbilt vs Saint Mary's
  "match-1-23": "4793460a-c60c-4d89-811d-e3759c049156", // North Carolina vs Ole Miss
  "match-1-24": "2c7ff907-8502-48c3-8e10-7be83df6f7c9", // Grand Canyon vs Maryland
  "match-1-25": "df32ec4b-7dd0-4f4b-85cf-3d2d31a87a92", // Norfolk State vs Florida
  "match-1-26": "5d02bb8c-61ac-41bf-b286-e4846e09deea", // Troy vs Kentucky
  "match-1-27": "c6f49159-89f8-4094-b153-e0cce89ca31e", // New Mexico vs Marquette
  "match-1-28": "252055f7-a334-4310-aa6c-d05de0453a96", // Akron vs Arizona
  "match-1-29": "a6672cc7-8ed6-4785-a792-eafe31ca6b66", // Oklahoma vs UConn
  "match-1-30": "7ed6589d-3acd-453b-be65-a937f02849be", // Xavier vs Illinois
  "match-1-31": "fb03dac5-6aad-4377-a717-1afd67381710", // Bryant vs Michigan State
  "match-1-32": "e948dc39-61cb-4476-8e9c-b541cf02b94c", // Liberty vs Oregon
  // Add more mappings for other rounds as needed
}

// Flag to enable mock data when API is unavailable - with fallback to true if env var is not defined
const USE_MOCK_DATA = 
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === undefined ? 
  true : // Default to true if not defined
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"; // Parse string value otherwise

console.log("Mock data setting:", { USE_MOCK_DATA, envValue: process.env.NEXT_PUBLIC_USE_MOCK_DATA });

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const round = searchParams.get("round") || "1"
    const useMock = searchParams.get("mock") === "true" || USE_MOCK_DATA

    // Test API connection first, but only once per server instance
    let apiAvailable = false
    try {
      apiAvailable = await testApiConnection()
      console.log(`Sportradar API connection test: ${apiAvailable ? "SUCCESS" : "FAILED"}`)
    } catch (error) {
      console.error("Error testing API connection:", error)
    }

    // If API is not available, force mock data
    const forceMock = !apiAvailable || useMock

    // If a specific match ID is provided, fetch only that match
    if (matchId) {
      // Get our match data
      const matches = await fetchBracketData(Number.parseInt(round), ["all"])
      const match = matches.find((m) => m.id === matchId)

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }

      // Check if we already have this game's final score in our completed games cache
      const completedGame = completedGames[matchId]
      if (completedGame) {
        console.log(`Using cached completed game data for ${matchId}`)
        const updatedMatch = {
          ...match,
          teamA: {
            ...match.teamA,
            score: completedGame.teamAScore
          },
          teamB: {
            ...match.teamB,
            score: completedGame.teamBScore
          },
          winner: completedGame.winner,
          teams: [
            {
              ...match.teamA,
              score: completedGame.teamAScore
            },
            {
              ...match.teamB,
              score: completedGame.teamBScore
            }
          ]
        }
        return NextResponse.json({ 
          match: updatedMatch,
          _status: "completed",
          _lastUpdated: new Date(completedGame.lastUpdated).toISOString()
        })
      }

      // Check if we should call the API based on game status
      const gameStatus = getGameStatus(match)
      const shouldFetchData = gameStatus === "active" && !forceMock
      const sportradarId = GAME_ID_MAPPING[matchId]

      if (sportradarId && shouldFetchData) {
        try {
          // Try to fetch from Sportradar API
          console.log(`Fetching live data for active game ${matchId}`)
          const gameData = await fetchGameData(sportradarId)
          const updatedMatch = mapSportradarGameToMatch(gameData, match)
          
          // If the game has a winner now, store it in our completed games cache
          if (updatedMatch.winner && gameStatus === "active") {
            storeCompletedGame(
              matchId, 
              updatedMatch.teamA.score,
              updatedMatch.teamB.score,
              updatedMatch.winner
            )
          }
          
          return NextResponse.json({ 
            match: updatedMatch,
            _status: gameStatus,
            _apiCalled: true
          })
        } catch (error) {
          console.error(`Error fetching data for match ${matchId}:`, error)

          // Fall back to mock data on error
          console.log(`Using mock data for match ${matchId} due to API error`)
          const mockData = generateMockGameData(match)
          const updatedMatch = mapSportradarGameToMatch(mockData, match)
          return NextResponse.json({
            match: updatedMatch,
            _mock: true,
            _status: gameStatus,
            _error: error instanceof Error ? error.message : String(error)
          })
        }
      } else {
        // Either not an active game or force mock is true
        if (gameStatus !== "active") {
          console.log(`Not fetching API data for ${matchId} - game status: ${gameStatus}`)
          return NextResponse.json({ 
            match, 
            _status: gameStatus,
            _apiCalled: false
          })
        } else if (forceMock) {
          console.log(`Using mock data for match ${matchId} (forced)`)
          const mockData = generateMockGameData(match)
          const updatedMatch = mapSportradarGameToMatch(mockData, match)
          return NextResponse.json({
            match: updatedMatch,
            _mock: true,
            _status: gameStatus
          })
        }
        return NextResponse.json({ match, _status: gameStatus })
      }
    }

    // If no specific match ID, fetch all matches for the round
    const matches = await fetchBracketData(Number.parseInt(round), ["all"])
    const updatedMatches = []
    let usedMockData = false
    let apiCallCount = 0

    // For each match, try to fetch live scores if appropriate
    for (const match of matches) {
      // First check if this is a completed game we already have cached
      const completedGame = completedGames[match.id]
      if (completedGame) {
        console.log(`Using cached completed game data for ${match.id}`)
        const updatedMatch = {
          ...match,
          teamA: {
            ...match.teamA,
            score: completedGame.teamAScore
          },
          teamB: {
            ...match.teamB,
            score: completedGame.teamBScore
          },
          winner: completedGame.winner,
          teams: [
            {
              ...match.teamA,
              score: completedGame.teamAScore
            },
            {
              ...match.teamB,
              score: completedGame.teamBScore
            }
          ]
        }
        updatedMatches.push(updatedMatch)
        continue
      }
      
      // Check if we should call the API based on game status
      const gameStatus = getGameStatus(match)
      const shouldFetchData = gameStatus === "active" && !forceMock
      const sportradarId = GAME_ID_MAPPING[match.id]

      if (sportradarId && shouldFetchData) {
        try {
          // Try to fetch from Sportradar API, but only for active games
          console.log(`Fetching live data for active game ${match.id}`)
          apiCallCount++
          
          const gameData = await fetchGameData(sportradarId)
          const updatedMatch = mapSportradarGameToMatch(gameData, match)
          
          // If the game has a winner now, store it in our completed games cache
          if (updatedMatch.winner && gameStatus === "active") {
            storeCompletedGame(
              match.id, 
              updatedMatch.teamA.score,
              updatedMatch.teamB.score,
              updatedMatch.winner
            )
          }
          
          updatedMatches.push(updatedMatch)
        } catch (error) {
          console.error(`Error fetching data for match ${match.id}:`, error)

          // Use mock data on error
          console.log(`Using mock data for match ${match.id} due to API error`)
          const mockData = generateMockGameData(match)
          const updatedMatch = mapSportradarGameToMatch(mockData, match)
          updatedMatches.push(updatedMatch)
          usedMockData = true
        }
      } else {
        // Either not an active game or force mock is true
        if (gameStatus !== "active") {
          console.log(`Not fetching API data for ${match.id} - game status: ${gameStatus}`)
          updatedMatches.push(match)
        } else if (forceMock) {
          console.log(`Using mock data for match ${match.id} (forced)`)
          const mockData = generateMockGameData(match)
          const updatedMatch = mapSportradarGameToMatch(mockData, match)
          updatedMatches.push(updatedMatch)
          usedMockData = true
        } else {
          // Otherwise use the original match
          updatedMatches.push(match)
        }
      }
    }

    return NextResponse.json({
      matches: updatedMatches,
      _mock: usedMockData || forceMock,
      _apiAvailable: apiAvailable,
      _apiCallCount: apiCallCount,
      _timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching scores:", error)

    // On critical error, try to return mock data for all matches
    try {
      const { searchParams } = new URL(request.url)
      const matches = await fetchBracketData(Number.parseInt(searchParams?.get("round") || "1"), ["all"])
      const mockMatches = matches.map((match) => {
        const mockData = generateMockGameData(match)
        return mapSportradarGameToMatch(mockData, match)
      })

      return NextResponse.json({
        matches: mockMatches,
        _mock: true,
        _error: "Used mock data due to critical error",
      })
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Failed to fetch scores and mock data generation failed",
          originalError: error instanceof Error ? error.message : String(error),
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        },
        { status: 500 },
      )
    }
  }
}

