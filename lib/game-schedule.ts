import { Match } from "@/types/match";

// Games are considered active 30 minutes before scheduled start time
const GAME_ACTIVE_BUFFER_MINUTES = 30;

// Type for game status
export type GameStatus = "upcoming" | "active" | "completed";

// Interface for completed game data
export interface CompletedGameScore {
  teamAScore: number;
  teamBScore: number;
  winner: string;
  lastUpdated: number; // Timestamp of when this data was last updated
}

// Map of completed game scores to avoid querying the API for completed games
export const completedGames: Record<string, CompletedGameScore> = {
  // Add any pre-completed games here
  // "match-1-1": {
  //   teamAScore: 78,
  //   teamBScore: 82,
  //   winner: "louisville",
  //   lastUpdated: 1679580000000
  // }
};

// Default date for games if parsing fails (today's date)
const DEFAULT_GAME_DATE = new Date();
// Set to 2PM local time by default
DEFAULT_GAME_DATE.setHours(14, 0, 0, 0);

// Parse match date/time to get a Date object
export function parseMatchDateTime(match: Match): Date | null {
  try {
    // Extract date and time strings
    const dateStr = match.date;
    const timeStr = match.time;

    if (!dateStr && !timeStr) {
      console.warn(`Missing both date and time for match ${match.id}, using default date`);
      return DEFAULT_GAME_DATE;
    }

    // Convert month name to number (e.g., "March" -> 2 for 0-indexed months)
    const monthMap: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    
    // Initialize date components with defaults
    let year = DEFAULT_GAME_DATE.getFullYear();
    let month = DEFAULT_GAME_DATE.getMonth();
    let day = DEFAULT_GAME_DATE.getDate();
    let hour = 14; // Default to 2PM
    let minute = 0;

    // Parse the date string if available
    if (dateStr) {
      try {
        // Handle different date formats
        // Format 1: "Thursday, March 20, 2025"
        // Format 2: "March 20, 2025"
        // Format 3: "March 20" (missing year)
        
        // Extract month, day, year regardless of format
        const monthMatch = dateStr.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
        const dayMatch = dateStr.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
        const yearMatch = dateStr.match(/\b(20\d{2})\b/); // Match years in the 2000s
        
        if (monthMatch) {
          const monthName = monthMatch[1].toLowerCase();
          if (monthMap[monthName] !== undefined) {
            month = monthMap[monthName];
          } else {
            console.warn(`Invalid month in date for match ${match.id}: ${monthName}`);
          }
        }
        
        if (dayMatch) {
          day = parseInt(dayMatch[1]);
        }
        
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
        }
      } catch (dateError) {
        console.warn(`Error parsing date for match ${match.id}: ${dateStr}`, dateError);
        // Continue with defaults already set
      }
    }

    // Parse the time string if available
    if (timeStr) {
      try {
        // Parse the time string (e.g., "10:15 AM MST")
        // Get hour and minute
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          hour = parseInt(timeMatch[1]);
          minute = parseInt(timeMatch[2]);
          
          // Handle AM/PM if present
          const meridiem = timeMatch[3]?.toUpperCase();
          if (meridiem === 'PM' && hour < 12) {
            hour += 12;
          } else if (meridiem === 'AM' && hour === 12) {
            hour = 0;
          }
        }
      } catch (timeError) {
        console.warn(`Error parsing time for match ${match.id}: ${timeStr}`, timeError);
        // Continue with defaults already set
      }
    }
    
    // Validate all components make sense
    if (month < 0 || month > 11) {
      console.warn(`Invalid month (${month}) for match ${match.id}, using current month`);
      month = DEFAULT_GAME_DATE.getMonth();
    }
    
    if (day < 1 || day > 31) {
      console.warn(`Invalid day (${day}) for match ${match.id}, using current day`);
      day = DEFAULT_GAME_DATE.getDate();
    }
    
    if (hour < 0 || hour > 23) {
      console.warn(`Invalid hour (${hour}) for match ${match.id}, using default 2PM`);
      hour = 14;
    }
    
    if (minute < 0 || minute > 59) {
      console.warn(`Invalid minute (${minute}) for match ${match.id}, using default 0`);
      minute = 0;
    }

    // Create the Date object
    return new Date(year, month, day, hour, minute);
  } catch (error) {
    console.error(`Error parsing date/time for match ${match.id}:`, error);
    // Return a default date for safety
    return DEFAULT_GAME_DATE;
  }
}

// Determine if a game is active, completed, or upcoming
export function getGameStatus(match: Match): GameStatus {
  try {
    // If the game is in our completedGames map, it's already done
    if (completedGames[match.id]) {
      return "completed";
    }

    // If the winner is already set, mark as completed
    if (match.winner) {
      return "completed";
    }

    // Get the game's scheduled start time
    const gameDate = parseMatchDateTime(match);
    if (!gameDate) {
      // If we can't parse the date, assume it's active to be safe
      console.warn(`Could not parse date for match ${match.id}, assuming active`);
      return "active";
    }

    const now = new Date();
    
    // Calculate game end time (approx 2.5 hours after start)
    const gameEndTime = new Date(gameDate);
    gameEndTime.setHours(gameEndTime.getHours() + 2);
    gameEndTime.setMinutes(gameEndTime.getMinutes() + 30);
    
    // Calculate game start time with buffer
    const gameStartTimeWithBuffer = new Date(gameDate);
    gameStartTimeWithBuffer.setMinutes(gameStartTimeWithBuffer.getMinutes() - GAME_ACTIVE_BUFFER_MINUTES);
    
    // Debug log to help troubleshoot date issues
    console.log(`Match ${match.id} timing:`, {
      match: `${match.teamA.name} vs ${match.teamB.name}`,
      dateStr: match.date,
      timeStr: match.time,
      parsed: gameDate.toISOString(),
      now: now.toISOString(),
      startBuffer: gameStartTimeWithBuffer.toISOString(),
      endTime: gameEndTime.toISOString(),
    });
    
    if (now > gameEndTime) {
      return "completed";
    } else if (now >= gameStartTimeWithBuffer) {
      return "active";
    } else {
      return "upcoming";
    }
  } catch (error) {
    console.error(`Error determining game status for match ${match.id}:`, error);
    // Default to active if there's any error
    return "active";
  }
}

// Store completed game data to avoid future API calls
export function storeCompletedGame(
  matchId: string,
  teamAScore: number,
  teamBScore: number,
  winner: string
): void {
  completedGames[matchId] = {
    teamAScore,
    teamBScore,
    winner,
    lastUpdated: Date.now()
  };
  
  // In a real app, you would save this to a database or localStorage
  console.log(`Game ${matchId} stored as completed with scores ${teamAScore}-${teamBScore}`);
  
  // Here we could save to localStorage in the browser
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const allGames = { ...completedGames };
      localStorage.setItem('completedGames', JSON.stringify(allGames));
    }
  } catch (e) {
    console.warn('Could not save completed games to localStorage', e);
  }
}

// Load completed games from storage when module initializes
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('completedGames');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(key => {
        completedGames[key] = parsed[key];
      });
      console.log(`Loaded ${Object.keys(parsed).length} completed games from localStorage`);
    }
  }
} catch (e) {
  console.warn('Could not load completed games from localStorage', e);
}

// Check if we should call the API for this game
export function shouldFetchGameData(match: Match): boolean {
  const status = getGameStatus(match);
  return status === "active";
} 