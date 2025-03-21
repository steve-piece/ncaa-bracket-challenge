// Sportradar API integration for NCAA Men's Basketball
import type { Match } from "@/types/match"

// Base URL for the Sportradar API
const BASE_URL = "https://api.sportradar.com/ncaamb/trial/v8"
const API_FORMAT = "json"
const LOCALE = "en"

// Simple in-memory API response cache
interface CacheEntry {
  data: any;
  expiry: number;
}

const API_CACHE: Record<string, CacheEntry> = {};

// Cache TTL in milliseconds
const CACHE_TTL = {
  gameData: 60 * 1000,        // 1 minute for game data 
  testConnection: 300 * 1000,  // 5 minutes for connection tests
  dailySchedule: 3600 * 1000,  // 1 hour for daily schedule
};

// Function to get cached data or null if not found/expired
function getCachedData(cacheKey: string): any | null {
  const entry = API_CACHE[cacheKey];
  if (!entry) return null;
  
  const now = Date.now();
  if (now > entry.expiry) {
    // Cache expired
    delete API_CACHE[cacheKey];
    return null;
  }
  
  return entry.data;
}

// Function to cache data with appropriate TTL
function cacheApiResponse(cacheKey: string, data: any, type: keyof typeof CACHE_TTL): void {
  const ttl = CACHE_TTL[type] || CACHE_TTL.gameData;
  API_CACHE[cacheKey] = {
    data,
    expiry: Date.now() + ttl
  };
}

// Rate limiting variables
const API_CALLS = new Map<string, number[]>(); // Timestamp tracking for rate limiting
const MAX_CALLS_PER_SECOND = 1; // Maximum calls per second
const MAX_CALLS_PER_MINUTE = 10; // Maximum calls per minute
const BACKOFF_TIME_MS = 2000; // Initial backoff time in milliseconds

// Helper function for rate limiting
async function checkRateLimit(endpoint: string): Promise<void> {
  const now = Date.now();
  const oneSecondAgo = now - 1000;
  const oneMinuteAgo = now - 60000;
  
  // Get existing timestamps for this endpoint or initialize empty array
  const timestamps = API_CALLS.get(endpoint) || [];
  
  // Clean up old timestamps
  const recentTimestamps = timestamps.filter(time => time > oneMinuteAgo);
  
  // Check if we've exceeded rate limits
  const callsLastSecond = recentTimestamps.filter(time => time > oneSecondAgo).length;
  const callsLastMinute = recentTimestamps.length;
  
  if (callsLastSecond >= MAX_CALLS_PER_SECOND || callsLastMinute >= MAX_CALLS_PER_MINUTE) {
    // Calculate backoff time with exponential increase based on usage
    const backoffMultiplier = Math.min(
      Math.pow(2, Math.max(callsLastSecond - MAX_CALLS_PER_SECOND, 0)), 
      Math.pow(1.5, Math.max(callsLastMinute - MAX_CALLS_PER_MINUTE, 0))
    );
    const backoffTime = BACKOFF_TIME_MS * backoffMultiplier;
    
    console.log(`Rate limit approached for ${endpoint}. Backing off for ${backoffTime}ms`);
    await new Promise(resolve => setTimeout(resolve, backoffTime));
    
    // Recursive call after waiting to check again
    return checkRateLimit(endpoint);
  }
  
  // Add current timestamp to the list
  recentTimestamps.push(now);
  API_CALLS.set(endpoint, recentTimestamps);
}

// Function to fetch game data from Sportradar API
export async function fetchGameData(gameId: string): Promise<any> {
  // Get API key from environment variable
  const apiKey = process.env.SPORTRADAR_API_KEY

  if (!apiKey || apiKey === "your_api_key_here") {
    console.error("Sportradar API key is not configured or is using the default placeholder value")
    throw new Error("API key not configured properly")
  }

  // Create a cache key for this request
  const cacheKey = `sportradar_game_${gameId}`;
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for game ${gameId}`);
    return cachedData;
  }
  
  try {
    // Rate limit check before making the request
    await checkRateLimit('game_data');
    
    // Log the request URL for debugging
    const requestUrl = `${BASE_URL}/${LOCALE}/games/${gameId}/boxscore.${API_FORMAT}?api_key=${apiKey}`
    console.log(`Fetching Sportradar data from: ${requestUrl.replace(apiKey, "API_KEY_HIDDEN")}`)

    const response = await fetch(requestUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // Fix conflicting cache settings - use revalidate only
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
      // Enhanced error message with status code and text
      const errorMessage = `API request failed with status ${response.status} (${response.statusText})`
      console.error(errorMessage)

      // For 404 errors, we'll throw a specific error that can be caught and handled
      if (response.status === 404) {
        throw new Error(`Game ID ${gameId} not found (404)`)
      }
      
      // For 403 errors, we'll throw a more helpful error message
      if (response.status === 403) {
        throw new Error("API authentication failed (403): Check that your API key is valid and has access to NCAA Men's Basketball")
      }
      
      // For 429 errors, throw a rate limit error
      if (response.status === 429) {
        // Add extra backoff for rate limit errors
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
        console.warn(`Rate limit exceeded (429). Will retry after ${waitTime}ms`);
        
        // Add larger delay to the API call tracking
        const timestamps = API_CALLS.get('game_data') || [];
        // Add future timestamps to force waiting
        for (let i = 0; i < 5; i++) {
          timestamps.push(Date.now() + (i * 1000));
        }
        API_CALLS.set('game_data', timestamps);
        
        throw new Error(`Rate limit exceeded. Please try again later (429)`);
      }

      throw new Error(errorMessage)
    }

    const data = await response.json();
    
    // Cache the successful response
    cacheApiResponse(cacheKey, data, 'gameData');
    
    return data;
  } catch (error) {
    console.error(`Error fetching game data from Sportradar for game ID ${gameId}:`, error)
    throw error
  }
}

// Function to test API connectivity
export async function testApiConnection(): Promise<boolean> {
  try {
    const apiKey = process.env.SPORTRADAR_API_KEY
    
    // Check if API key is not configured or is using the default placeholder
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("Cannot test API connection: API key not configured or using placeholder value")
      return false
    }

    // Check cache for recent test result
    const cacheKey = "api_connection_test";
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult !== null) {
      console.log("Using cached API connection test result");
      return cachedResult;
    }
    
    // Rate limit check before making the request
    await checkRateLimit('test_connection');
    
    // Try to fetch a simple endpoint that should always exist
    const testUrl = `${BASE_URL}/${LOCALE}/league/hierarchy.${API_FORMAT}?api_key=${apiKey}`
    console.log(`Testing API connection with: ${testUrl.replace(apiKey, "API_KEY_HIDDEN")}`)
    
    const response = await fetch(testUrl, {
      method: "GET", // Changed from HEAD to GET as some APIs don't support HEAD requests properly
      headers: {
        "Content-Type": "application/json",
      },
      // Use consistent cache approach
      next: { revalidate: 300 } // Cache test connection result for 5 minutes
    })

    console.log(`API test response status: ${response.status} (${response.statusText})`)
    
    const result = response.ok;
    
    // Cache the test result
    cacheApiResponse(cacheKey, result, 'testConnection');
    
    return result;
  } catch (error) {
    console.error("API connection test failed:", error)
    return false
  }
}

// Function to fetch daily schedule
export async function fetchDailySchedule(year: string, month: string, day: string): Promise<any> {
  const apiKey = process.env.SPORTRADAR_API_KEY

  if (!apiKey || apiKey === "your_api_key_here") {
    console.error("Sportradar API key is not configured or is using the default placeholder value")
    throw new Error("API key not configured properly")
  }

  // Create cache key for daily schedule
  const cacheKey = `daily_schedule_${year}_${month}_${day}`;
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for daily schedule ${year}-${month}-${day}`);
    return cachedData;
  }
  
  try {
    // Rate limit check before making the request
    await checkRateLimit('daily_schedule');
    
    const requestUrl = `${BASE_URL}/${LOCALE}/games/${year}/${month}/${day}/schedule.${API_FORMAT}?api_key=${apiKey}`
    console.log(`Fetching daily schedule from: ${requestUrl.replace(apiKey, "API_KEY_HIDDEN")}`)

    const response = await fetch(requestUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // Fix conflicting cache settings - use revalidate only
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      const errorMessage = `API request failed with status ${response.status} (${response.statusText})`
      console.error(errorMessage)
      
      // For 403 errors, provide a more helpful error message
      if (response.status === 403) {
        throw new Error("API authentication failed (403): Check that your API key is valid and has access to NCAA Men's Basketball")
      }
      
      // For 429 errors, throw a rate limit error
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again later (429)`);
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json();
    
    // Cache the successful response
    cacheApiResponse(cacheKey, data, 'dailySchedule');
    
    return data;
  } catch (error) {
    console.error(`Error fetching daily schedule from Sportradar for ${year}-${month}-${day}:`, error)
    throw error
  }
}

// Function to validate if a game ID exists in the Sportradar system
export async function validateGameId(gameId: string): Promise<boolean> {
  try {
    await fetchGameData(gameId)
    return true
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      console.warn(`Game ID ${gameId} validation failed: Not found in Sportradar system`)
      return false
    }
    // For other errors (like network issues), we'll assume the ID might be valid
    console.warn(`Game ID ${gameId} validation inconclusive due to error:`, error)
    return false
  }
}

// Map Sportradar game data to our Match type
export function mapSportradarGameToMatch(gameData: any, existingMatch: Match): Match {
  try {
    // Validate that the gameData has the expected structure
    if (!gameData || !gameData.home || !gameData.away) {
      console.error("Invalid game data structure:", gameData)
      return existingMatch // Return the existing match unchanged
    }

    // Extract home and away teams
    const homeTeam = gameData.home
    const awayTeam = gameData.away

    // Find which team in our match corresponds to home/away
    // Use a more flexible matching approach
    const homeTeamName = homeTeam.name.toLowerCase()
    const awayTeamName = awayTeam.name.toLowerCase()
    const teamAName = existingMatch.teamA.name.toLowerCase()
    const teamBName = existingMatch.teamB.name.toLowerCase()

    // Check if team names contain each other (more flexible matching)
    const isTeamAHome =
      teamAName.includes(homeTeamName) ||
      homeTeamName.includes(teamAName) ||
      // Try matching by abbreviation or nickname if available
      (homeTeam.alias && teamAName.includes(homeTeam.alias.toLowerCase())) ||
      (homeTeam.nickname && teamAName.includes(homeTeam.nickname.toLowerCase()))

    // Handle the case where points might be "-" string instead of a number
    const getScore = (points: any): number => {
      if (points === "-" || points === undefined || points === null) {
        return 0 // Return 0 for display purposes, but we'll handle this in the UI
      }
      return typeof points === "number" ? points : 0
    }

    // Update team scores
    const updatedTeamA = {
      ...existingMatch.teamA,
      score: isTeamAHome ? getScore(homeTeam.points) : getScore(awayTeam.points),
      scoreUnavailable: homeTeam.points === "-" || awayTeam.points === "-", // Add flag for unavailable scores
    }

    const updatedTeamB = {
      ...existingMatch.teamB,
      score: isTeamAHome ? getScore(awayTeam.points) : getScore(homeTeam.points),
      scoreUnavailable: homeTeam.points === "-" || awayTeam.points === "-", // Add flag for unavailable scores
    }

    // Determine winner if game is complete
    let winner = existingMatch.winner
    if (gameData.status === "complete" || gameData.status === "closed") {
      if (homeTeam.points !== "-" && awayTeam.points !== "-") {
        winner =
          (homeTeam.points || 0) > (awayTeam.points || 0)
            ? isTeamAHome
              ? updatedTeamA.id
              : updatedTeamB.id
            : isTeamAHome
              ? updatedTeamB.id
              : updatedTeamA.id
      }
    }

    return {
      ...existingMatch,
      teamA: updatedTeamA,
      teamB: updatedTeamB,
      winner,
      teams: [updatedTeamA, updatedTeamB],
      dataUnavailable: homeTeam.points === "-" || awayTeam.points === "-", // Add flag for unavailable data
    }
  } catch (error) {
    console.error("Error mapping Sportradar game data to match:", error)
    return existingMatch // Return the existing match unchanged on error
  }
}

// Create a mock game data generator for testing or when API fails
export function generateMockGameData(match: Match): any {
  // Instead of random scores, use "-" to indicate API failure
  return {
    id: match.id,
    status: "scheduled", // Always use scheduled status for API failures
    home: {
      name: match.teamA.name,
      points: "-", // Use "-" instead of a number
    },
    away: {
      name: match.teamB.name,
      points: "-", // Use "-" instead of a number
    },
  }
}

