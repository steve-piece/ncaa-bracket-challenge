"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchBracketData } from "@/lib/api"
import { Copy } from "lucide-react"

export default function GameIdMapper() {
  const [round, setRound] = useState(1)
  const [matches, setMatches] = useState<any[]>([])
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [sportradarGames, setSportradarGames] = useState<any[]>([])

  // Load matches from our application
  const loadMatches = async () => {
    setLoading(true)
    try {
      const data = await fetchBracketData(round, ["all"])
      setMatches(data)

      // Initialize mappings with existing values
      const initialMappings: Record<string, string> = {}
      data.forEach((match) => {
        initialMappings[match.id] = mappings[match.id] || ""
      })
      setMappings(initialMappings)
    } catch (error) {
      console.error("Error loading matches:", error)
    } finally {
      setLoading(false)
    }
  }

  // Parse Sportradar JSON
  const parseJson = () => {
    try {
      const data = JSON.parse(jsonInput)
      if (data.games) {
        setSportradarGames(data.games)
      } else if (Array.isArray(data)) {
        setSportradarGames(data)
      } else {
        alert("Could not find games array in the JSON. Please check the format.")
      }
    } catch (error) {
      alert("Invalid JSON. Please check the format.")
      console.error("Error parsing JSON:", error)
    }
  }

  // Update a single mapping
  const updateMapping = (matchId: string, sportradarId: string) => {
    setMappings((prev) => ({
      ...prev,
      [matchId]: sportradarId,
    }))
  }

  // Generate code for the GAME_ID_MAPPING object
  const generateMappingCode = () => {
    const mappingEntries = Object.entries(mappings)
      .filter(([_, value]) => value)
      .map(([key, value]) => `  "${key}": "${value}"`)
      .join(",\n")

    return `const GAME_ID_MAPPING: Record<string, string> = {\n${mappingEntries}\n  // Add more mappings as needed\n}`
  }

  // Copy mapping code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generateMappingCode())
      .then(() => alert("Mapping code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err))
  }

  return (
    <div className="space-y-6">
      <Card className="border border-primary/30 neon-box">
        <CardHeader>
          <CardTitle className="font-rajdhani">Game ID Mapper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="round">Tournament Round</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="round"
                  type="number"
                  min="1"
                  max="6"
                  value={round}
                  onChange={(e) => setRound(Number.parseInt(e.target.value))}
                />
                <Button onClick={loadMatches} disabled={loading}>
                  {loading ? "Loading..." : "Load Matches"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="jsonInput">Paste Sportradar JSON</Label>
              <textarea
                id="jsonInput"
                className="w-full h-32 p-2 mt-1 bg-black border border-primary/30 rounded-md"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button onClick={parseJson} className="mt-2">
                Parse JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card className="border border-primary/30 neon-box">
          <CardHeader>
            <CardTitle className="font-rajdhani">Match Game IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="p-3 border border-primary/20 rounded-md">
                  <div className="font-exo text-accent mb-2">
                    {match.teamA.name} vs {match.teamB.name} ({match.region} - {match.roundName})
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-sm text-muted-foreground font-mono">{match.id}</div>
                    <Input
                      placeholder="Sportradar Game ID"
                      value={mappings[match.id] || ""}
                      onChange={(e) => updateMapping(match.id, e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sportradarGames.length > 0 && (
        <Card className="border border-primary/30 neon-box">
          <CardHeader>
            <CardTitle className="font-rajdhani">Sportradar Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sportradarGames.map((game, index) => (
                <div key={index} className="p-3 border border-primary/20 rounded-md">
                  <div className="font-exo text-accent mb-2">
                    {game.home?.name || "Home Team"} vs {game.away?.name || "Away Team"}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-sm text-muted-foreground font-mono">ID: {game.id}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(game.id)
                        alert(`Game ID "${game.id}" copied to clipboard!`)
                      }}
                    >
                      Copy ID
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(mappings).length > 0 && (
        <Card className="border border-primary/30 neon-box">
          <CardHeader>
            <CardTitle className="font-rajdhani">Generated Mapping Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 bg-black/50 border border-primary/20 rounded-md overflow-x-auto">
                <code>{generateMappingCode()}</code>
              </pre>
              <Button size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Copy this code and replace the GAME_ID_MAPPING object in <code>app/api/scores/route.ts</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

