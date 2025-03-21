import type { Team } from "./team"

export interface Match {
  id: string
  round: number
  roundName: string
  region: string
  date: string
  time: string
  location: string
  teamA: Team
  teamB: Team
  winner: string | null
  predictions: Record<string, string>
  teams: Team[]
  pointSpread?: number
  pointSpreadSource?: string
  dataUnavailable?: boolean
}

