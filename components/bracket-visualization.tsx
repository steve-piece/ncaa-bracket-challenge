"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { animate } from "motion"
import { Card } from "@/components/ui/card"
import { useBracketData } from "@/hooks/use-bracket-data"
import type { Team } from "@/types/team"
import type { Match } from "@/types/match"
import { createWebGLParticles } from "@/lib/webgl-effects"
import { Check, Brain, Cpu, Sparkles, Zap, Bot, Lightbulb } from "lucide-react"

// Add this import at the top of the file
import { useLiveScores } from "@/hooks/use-live-scores"

// Type definitions for animation
type AnimationProps = Record<string, any>;
type AnimationOpts = Record<string, any>;

interface BracketVisualizationProps {
  selectedRound: number
  selectedAgents: string[]
}

function AnimationStyleSelector({
  selectedStyle,
  onSelectStyle,
}: {
  selectedStyle: string
  onSelectStyle: (style: string) => void
}) {
  const styles = [
    { id: "parallax", name: "3D Parallax" },
    { id: "neon-slide", name: "Neon Slide" },
    { id: "data-scan", name: "Data Scan" },
  ]

  return (
    <div className="mb-4">
      <h4 className="font-exo text-accent mb-2">ANIMATION STYLE</h4>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={`px-3 py-1 text-sm font-exo rounded-md transition-all ${
              selectedStyle === style.id
                ? "bg-accent text-black"
                : "bg-black border border-primary/30 text-white hover:bg-primary/20"
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Update the BracketVisualization component to show more data status information
export function BracketVisualization({ selectedRound, selectedAgents }: BracketVisualizationProps) {
  const { matches: initialMatches, isLoading: isInitialLoading } = useBracketData(selectedRound, selectedAgents)
  const {
    matches,
    isLoading: isScoresLoading,
    isMockData,
    apiAvailable,
    lastUpdated,
    retryCount,
    error,
  } = useLiveScores(initialMatches)
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null)
  const [animationStyle, setAnimationStyle] = useState<string>("parallax")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = createWebGLParticles(canvasRef.current)
      return cleanup
    }
  }, [])

  const isLoading = isInitialLoading || isScoresLoading

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center font-rajdhani text-xl">
        <div className="inline-block animate-pulse">Loading bracket...</div>
      </div>
    )

  const getMatchColumns = () => {
    // Distribute matches into columns based on round
    const columns = []
    const matchesPerColumn = Math.ceil(matches.length / (selectedRound === 6 ? 1 : 2))

    for (let i = 0; i < matches.length; i += matchesPerColumn) {
      columns.push(matches.slice(i, i + matchesPerColumn))
    }

    return columns
  }

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return ""
    return lastUpdated.toLocaleTimeString()
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" width={1000} height={600} />

      <div className="flex justify-between items-center mb-4">
        <AnimationStyleSelector selectedStyle={animationStyle} onSelectStyle={setAnimationStyle} />

        {/* Enhanced data status indicator */}
        <div className="text-sm flex items-center gap-2">
          {apiAvailable === false && (
            <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-md font-exo">API Unavailable</span>
          )}

          {isMockData && (
            <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-md font-exo">Using simulated data</span>
          )}

          {error && (
            <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-md font-exo">
              Error: {error.message.substring(0, 30)}...
            </span>
          )}

          {lastUpdated && <span className="text-muted-foreground">Last updated: {formatLastUpdated()}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getMatchColumns().map((column, colIndex) => (
          <div key={colIndex} className="space-y-4">
            {column.map((match) =>
              animationStyle === "parallax" ? (
                <ParallaxMatchCard
                  key={match.id}
                  match={match}
                  isHovered={hoveredMatch === match.id}
                  onHover={() => setHoveredMatch(match.id)}
                  onLeave={() => setHoveredMatch(null)}
                  selectedAgents={selectedAgents}
                />
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  isHovered={hoveredMatch === match.id}
                  onHover={() => setHoveredMatch(match.id)}
                  onLeave={() => setHoveredMatch(null)}
                  selectedAgents={selectedAgents}
                  animationStyle={animationStyle}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Update the MatchCard component to accept the animationStyle prop
function MatchCard({
  match,
  isHovered,
  onHover,
  onLeave,
  selectedAgents,
  animationStyle = "parallax", // Default animation style
}: MatchCardProps & { animationStyle?: string }) {
  return (
    <div
      onMouseEnter={(e) => {
        onHover()
        animate(e.currentTarget, { scale: 1.02 } as AnimationProps, { duration: 0.2 } as AnimationOpts)
      }}
      onMouseLeave={(e) => {
        onLeave()
        animate(e.currentTarget, { scale: 1 } as AnimationProps, { duration: 0.2 } as AnimationOpts)
      }}
      className="transition-all"
    >
      <Card className="overflow-hidden border border-primary/30 neon-box relative">
        <div className="p-4">
          <div className="text-sm text-accent mb-3 font-exo">
            {match.region} - {match.roundName}
          </div>

          <div className="space-y-2">
            <TeamRow
              team={match.teamA}
              isWinner={match.winner === match.teamA.id}
              predictions={match.predictions}
              selectedAgents={selectedAgents}
            />
            <div className="text-center text-xs text-secondary font-exo">VS</div>
            <TeamRow
              team={match.teamB}
              isWinner={match.winner === match.teamB.id}
              predictions={match.predictions}
              selectedAgents={selectedAgents}
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">{match.date}</span> • {match.time} • {match.location}
          </div>

          {isHovered && (
            <div className={`mt-4 pt-4 border-t border-primary/30 text-sm overflow-hidden ${animationStyle}`}>
              {/* Cyber-Reveal Animation */}
              {animationStyle === "cyber-reveal" && (
                <div className="relative">
                  {/* Scanning line effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 pointer-events-none"
                    style={{ height: "100%" }}
                    ref={(el) => {
                      if (el) {
                        animate(
                          el, 
                          { y: ["-100%", "200%"], opacity: [0.7, 0] } as AnimationProps, 
                          { duration: 1.5, easing: "linear" } as AnimationOpts
                        )
                      }
                    }}
                  />

                  <div
                    className="grid grid-cols-2 gap-4"
                    ref={(el) => {
                      if (el) {
                        const elements = el.querySelectorAll("p, div")
                        elements.forEach((element, index) => {
                          animate(
                            element,
                            { opacity: [0, 1], x: [10, 0] } as AnimationProps,
                            { duration: 0.3, delay: 0.05 * index, easing: "ease-out" } as AnimationOpts
                          )
                        })
                      }
                    }}
                  >
                    <div>
                      <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                      <p className="text-muted-foreground font-sans">{match.date}</p>
                      <p className="text-muted-foreground font-sans">{match.location}</p>
                    </div>
                    <div>
                      <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                      <div className="space-y-1">
                        {Object.entries(match.predictions).map(([agentId, teamId], index) => (
                          <div
                            key={agentId}
                            className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center`}
                          >
                            <span className="mr-1">{getAgentName(agentId)}:</span>
                            <span className="font-medium">
                              {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                            </span>
                            {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Glitch-In Animation */}
              {animationStyle === "glitch-in" && (
                <div
                  className="grid grid-cols-2 gap-4"
                  ref={(el) => {
                    if (el) {
                      animate(el, { x: [-5, 5, -3, 3, 0], opacity: [0, 0.3, 0.5, 0.7, 1] } as AnimationProps, { duration: 0.4 } as AnimationOpts)

                      const elements = el.querySelectorAll("p, div")
                      elements.forEach((element, index) => {
                        setTimeout(() => {
                          animate(
                            element,
                            { x: [-3, 3, -2, 2, 0], opacity: [0.3, 0.5, 0.7, 0.9, 1] } as AnimationProps,
                            { duration: 0.2 } as AnimationOpts
                          )
                        }, index * 50)
                      })
                    }
                  }}
                >
                  <div>
                    <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                    <p className="text-muted-foreground font-sans">{match.date}</p>
                    <p className="text-muted-foreground font-sans">{match.location}</p>
                  </div>
                  <div>
                    <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                    <div className="space-y-1">
                      {Object.entries(match.predictions).map(([agentId, teamId]) => (
                        <div
                          key={agentId}
                          className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center`}
                        >
                          <span className="mr-1">{getAgentName(agentId)}:</span>
                          <span className="font-medium">
                            {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                          </span>
                          {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Blur-Focus Animation */}
              {animationStyle === "blur-focus" && (
                <div
                  className="grid grid-cols-2 gap-4"
                  ref={(el) => {
                    if (el) {
                      animate(
                        el,
                        { filter: ["blur(8px)", "blur(0px)"], opacity: [0, 1] } as AnimationProps,
                        { duration: 0.5, easing: "ease-out" } as AnimationOpts
                      )
                    }
                  }}
                >
                  <div>
                    <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                    <p className="text-muted-foreground font-sans">{match.date}</p>
                    <p className="text-muted-foreground font-sans">{match.location}</p>
                  </div>
                  <div>
                    <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                    <div className="space-y-1">
                      {Object.entries(match.predictions).map(([agentId, teamId]) => (
                        <div
                          key={agentId}
                          className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center`}
                        >
                          <span className="mr-1">{getAgentName(agentId)}:</span>
                          <span className="font-medium">
                            {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                          </span>
                          {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Neon-Slide Animation */}
              {animationStyle === "neon-slide" && (
                <div className="relative overflow-hidden">
                  {/* Neon border that slides in */}
                  <div
                    className="absolute inset-0 border-2 border-accent rounded-md pointer-events-none"
                    ref={(el) => {
                      if (el) {
                        animate(
                          el,
                          {
                            opacity: [0, 1],
                            scale: [0.9, 1],
                            boxShadow: ["0 0 0px rgba(0, 255, 198, 0)", "0 0 10px rgba(0, 255, 198, 0.7)"],
                          } as AnimationProps,
                          { duration: 0.4 } as AnimationOpts
                        )
                      }
                    }}
                  />

                  <div
                    className="grid grid-cols-2 gap-4 p-2"
                    ref={(el) => {
                      if (el) {
                        const leftCol = el.querySelector("div:first-child")
                        const rightCol = el.querySelector("div:last-child")

                        if (leftCol)
                          animate(
                            leftCol,
                            { x: ["-100%", "0%"], opacity: [0, 1] } as AnimationProps,
                            { duration: 0.4, easing: "ease-out" } as AnimationOpts
                          )

                        if (rightCol)
                          animate(
                            rightCol,
                            { x: ["100%", "0%"], opacity: [0, 1] } as AnimationProps,
                            { duration: 0.4, easing: "ease-out" } as AnimationOpts
                          )
                      }
                    }}
                  >
                    <div>
                      <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                      <p className="text-muted-foreground font-sans">{match.date}</p>
                      <p className="text-muted-foreground font-sans">{match.location}</p>
                    </div>
                    <div>
                      <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                      <div className="space-y-1">
                        {Object.entries(match.predictions).map(([agentId, teamId]) => (
                          <div
                            key={agentId}
                            className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center`}
                          >
                            <span className="mr-1">{getAgentName(agentId)}:</span>
                            <span className="font-medium">
                              {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                            </span>
                            {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data-Scan Animation */}
              {animationStyle === "data-scan" && (
                <div className="relative">
                  {/* Digital scan effect overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 pointer-events-none"
                    ref={(el) => {
                      if (el) animate(el, { x: ["-100%", "200%"] } as AnimationProps, { duration: 1.2, easing: "linear" } as AnimationOpts)
                    }}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      ref={(el) => {
                        if (el) {
                          const children = el.querySelectorAll("p")
                          children.forEach((child, index) => {
                            animate(
                              child,
                              {
                                opacity: [0, 1],
                                clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
                              } as AnimationProps,
                              { duration: 0.4, delay: index * 0.1 } as AnimationOpts
                            )
                          })
                        }
                      }}
                    >
                      <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                      <p className="text-muted-foreground font-sans">{match.date}</p>
                      <p className="text-muted-foreground font-sans">{match.location}</p>
                    </div>
                    <div
                      ref={(el) => {
                        if (el) {
                          // Animate the header
                          const header = el.querySelector("p")
                          if (header) {
                            animate(
                              header,
                              {
                                opacity: [0, 1],
                                clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
                              } as AnimationProps,
                              { duration: 0.4 } as AnimationOpts
                            )
                          }

                          // Animate each prediction with a typewriter-like effect
                          const predictions = el.querySelectorAll(".space-y-1 > div")
                          predictions.forEach((prediction, index) => {
                            animate(
                              prediction,
                              {
                                opacity: [0, 1],
                                clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
                              } as AnimationProps,
                              { duration: 0.3, delay: 0.4 + index * 0.1 } as AnimationOpts
                            )
                          })
                        }
                      }}
                    >
                      <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                      <div className="space-y-1">
                        {Object.entries(match.predictions).map(([agentId, teamId]) => (
                          <div
                            key={agentId}
                            className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center`}
                          >
                            <span className="mr-1">{getAgentName(agentId)}:</span>
                            <span className="font-medium">
                              {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                            </span>
                            {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Update the MatchCardProps interface to include the optional animationStyle
interface MatchCardProps {
  match: Match
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  selectedAgents: string[]
  animationStyle?: string
}

interface TeamRowProps {
  team: Team
  isWinner: boolean
  predictions: Record<string, string>
  selectedAgents: string[]
}

// Add this component after the imports
function AgentPredictionTooltip({
  agentId,
  teamName,
  isCorrect,
}: {
  agentId: string
  teamName: string
  isCorrect: boolean
}) {
  return (
    <div className="absolute -mt-12 -ml-16 z-10 bg-black/90 border border-primary/30 rounded-md p-2 text-xs w-32 shadow-lg">
      <div className="font-exo text-white">{getAgentName(agentId)}</div>
      <div className="text-muted-foreground">Picked: {teamName}</div>
      {isCorrect && <div className="text-green-500">Correct pick ✓</div>}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black border-r border-b border-primary/30"></div>
    </div>
  )
}

// Update the agent icon rendering in TeamRow to include tooltips
function TeamRow({ team, isWinner, predictions, selectedAgents }: TeamRowProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  const agentsPredictingThisTeam = Object.entries(predictions)
    .filter(([agentId, teamId]) => teamId === team.id)
    .map(([agentId]) => agentId)

  // Get the agents that correctly predicted this team (if this team is the winner)
  const correctPredictions = isWinner ? agentsPredictingThisTeam : []

  // Determine which selected agents picked this team
  const selectedAgentsPredictions = selectedAgents.includes("all")
    ? []
    : selectedAgents.filter((agentId) => predictions[agentId] === team.id)

  // Determine the border style based on selection state
  let borderStyle = ""
  if (isWinner) {
    borderStyle = "border-l-2 border-accent"
  }

  // Single agent selected and they picked this team
  const singleAgentCorrect =
    selectedAgents.length === 1 && selectedAgents[0] !== "all" && predictions[selectedAgents[0]] === team.id && isWinner

  // All agents selected and this is the winning team
  const allAgentsSelected = selectedAgents.includes("all") && isWinner

  // Multiple agents selected
  const multipleAgentsSelected = selectedAgents.length > 1 && !selectedAgents.includes("all")

  if (singleAgentCorrect) {
    borderStyle += " ring-2 ring-green-500"
  } else if (allAgentsSelected) {
    borderStyle += " ring-2 ring-primary"
  }

  // Get agent icon based on ID
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "claude":
        return <Brain className="w-3 h-3" />
      case "gpt4o":
        return <Lightbulb className="w-3 h-3" />
      case "perplexity":
        return <Cpu className="w-3 h-3" />
      case "deepseek":
        return <Bot className="w-3 h-3" />
      case "grok":
        return <Zap className="w-3 h-3" />
      case "gemini":
        return <Sparkles className="w-3 h-3" />
      default:
        return <Check className="w-3 h-3" />
    }
  }

  // Check if score is unavailable (API failure)
  const scoreUnavailable = team.scoreUnavailable || false

  return (
    <div
      className={`flex items-center p-3 rounded-md transition-colors duration-300 relative
        ${isWinner ? "bg-primary/10" : ""} 
        ${borderStyle}`}
      ref={(el) => {
        if (el && isWinner) {
          el.style.backgroundColor = "rgba(30, 42, 255, 0.1)"
        }
      }}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-black rounded-md mr-3 border border-primary/50 font-orbitron text-accent">
        <span className="font-bold">{team.seed}</span>
      </div>
      <div className="flex-1">
        <div className="font-exo font-medium">{team.name}</div>
        <div className="text-sm text-muted-foreground font-sans">{team.record}</div>
      </div>
      <div className="text-xl font-bold font-orbitron text-white">
        {scoreUnavailable ? "-" : team.score !== undefined ? team.score : "--"}
        {!scoreUnavailable && team.score > 0 && <span className="text-xs ml-1 text-accent animate-pulse">LIVE</span>}
      </div>

      {/* Agent prediction icons for multiple selections */}
      {multipleAgentsSelected && selectedAgentsPredictions.length > 0 && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {selectedAgentsPredictions.map((agentId) => (
            <div
              key={agentId}
              className={`w-5 h-5 rounded-full flex items-center justify-center
                ${isWinner ? "bg-green-500 agent-icon-correct" : "bg-secondary/80"} text-white
                shadow-md border border-white/20 agent-icon cursor-pointer`}
              onMouseEnter={() => setHoveredAgent(agentId)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {getAgentIcon(agentId)}
              {hoveredAgent === agentId && (
                <AgentPredictionTooltip agentId={agentId} teamName={team.name} isCorrect={isWinner} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to get agent name
function getAgentName(agentId: string): string {
  const agentNames: Record<string, string> = {
    claude: "Claude",
    gpt4o: "GPT-4o",
    perplexity: "Perplexity",
    deepseek: "DeepSeek",
    grok: "Grok",
    gemini: "Gemini",
  }
  return agentNames[agentId] || agentId
}

// This component demonstrates a more advanced parallax hover effect
function ParallaxMatchCard({ match, isHovered, onHover, onLeave, selectedAgents }: MatchCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate rotation based on mouse position
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = (x - centerX) / 20
    const rotateX = (centerY - y) / 20

    // Apply the transform
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

    // Move highlights based on mouse position
    const highlights = card.querySelectorAll(".highlight")
    highlights.forEach((highlight: Element) => {
      const highlightEl = highlight as HTMLElement
      highlightEl.style.transform = `translate(${(x - centerX) / 10}px, ${(y - centerY) / 10}px)`
    })
  }

  // Reset transform on mouse leave
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    // Reset the transform
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"

    // Call the original onLeave handler
    onLeave()

    // Reset scale
    animate(e.currentTarget, { scale: 1 } as AnimationProps, { duration: 0.2 } as AnimationOpts)
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={(e) => {
        onHover()
        animate(e.currentTarget, { scale: 1.02 } as AnimationProps, { duration: 0.2 } as AnimationOpts)
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-all"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.1s ease" }}
    >
      <Card className="overflow-hidden border border-primary/30 relative" style={{ transformStyle: "preserve-3d" }}>
        {/* Highlight effect that follows cursor */}
        <div
          className="absolute inset-0 bg-gradient-radial from-accent/20 to-transparent opacity-0 highlight"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: "translate(0, 0)",
            opacity: isHovered ? 0.5 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        <div className="p-4" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
          <div className="text-sm text-accent mb-3 font-exo" style={{ transform: "translateZ(10px)" }}>
            {match.region} - {match.roundName}
          </div>

          <div className="space-y-2" style={{ transform: "translateZ(20px)" }}>
            <TeamRow
              team={match.teamA}
              isWinner={match.winner === match.teamA.id}
              predictions={match.predictions}
              selectedAgents={selectedAgents}
            />
            <div className="text-center text-xs text-secondary font-exo">VS</div>
            <TeamRow
              team={match.teamB}
              isWinner={match.winner === match.teamB.id}
              predictions={match.predictions}
              selectedAgents={selectedAgents}
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">{match.date}</span> • {match.time} • {match.location}
          </div>

          {isHovered && (
            <div
              className="mt-4 pt-4 border-t border-primary/30 text-sm overflow-hidden"
              style={{ transform: "translateZ(40px)" }}
              ref={(el) => {
                if (el) {
                  // Create particle effect
                  for (let i = 0; i < 20; i++) {
                    const particle = document.createElement("div")
                    particle.className = "particle"

                    // Random starting position
                    const startX = Math.random() * el.offsetWidth
                    const startY = Math.random() * el.offsetHeight

                    // Random ending position
                    const endX = (Math.random() - 0.5) * 100
                    const endY = (Math.random() - 0.5) * 100

                    particle.style.left = `${startX}px`
                    particle.style.top = `${startY}px`
                    particle.style.setProperty("--x", `${endX}px`)
                    particle.style.setProperty("--y", `${endY}px`)

                    // Random delay
                    particle.style.animationDelay = `${Math.random() * 0.5}s`

                    el.appendChild(particle)

                    // Remove particles after animation
                    setTimeout(() => {
                      if (el.contains(particle)) {
                        el.removeChild(particle)
                      }
                    }, 1000)
                  }

                  // Animate content
                  animate(el, { opacity: [0, 1], y: [20, 0] } as AnimationProps, { duration: 0.4, easing: "ease-out" } as AnimationOpts)
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-exo font-medium text-accent mb-1">GAME DETAILS</p>
                  <p className="text-muted-foreground font-sans">{match.date}</p>
                  <p className="text-muted-foreground font-sans">{match.location}</p>
                </div>
                <div>
                  <p className="font-exo font-medium text-accent mb-1">AI PREDICTIONS</p>
                  <div className="space-y-1">
                    {Object.entries(match.predictions).map(([agentId, teamId], index) => (
                      <div
                        key={agentId}
                        className={`text-xs font-exo ${match.winner === teamId ? "text-accent" : "text-secondary"} flex items-center overflow-hidden`}
                        ref={(el) => {
                          if (el) {
                            animate(
                              el,
                              {
                                opacity: [0, 1],
                                clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
                              } as AnimationProps,
                              { duration: 0.3, delay: 0.1 + index * 0.1 } as AnimationOpts
                            )
                          }
                        }}
                      >
                        <span className="mr-1">{getAgentName(agentId)}:</span>
                        <span className="font-medium">
                          {match.teams.find((t) => t.id === teamId)?.name || "Unknown"}
                        </span>
                        {match.winner === teamId && <span className="ml-1 text-accent animate-pulse">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

