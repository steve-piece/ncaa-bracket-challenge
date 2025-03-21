"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Agent } from "@/types/agent"
import { Brain, Cpu, Sparkles, Zap, Bot, Lightbulb } from "lucide-react"

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgents: string[]
  onSelectAgents: (agentIds: string[]) => void
}

export function AgentSelector({ agents, selectedAgents, onSelectAgents }: AgentSelectorProps) {
  // Get agent icon based on ID
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "claude":
        return <Brain className="w-4 h-4" />
      case "gpt4o":
        return <Lightbulb className="w-4 h-4" />
      case "perplexity":
        return <Cpu className="w-4 h-4" />
      case "deepseek":
        return <Bot className="w-4 h-4" />
      case "grok":
        return <Zap className="w-4 h-4" />
      case "gemini":
        return <Sparkles className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleAgentToggle = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      onSelectAgents(selectedAgents.filter((id) => id !== agentId))
    } else {
      onSelectAgents([...selectedAgents, agentId])
    }
  }

  const handleAllToggle = () => {
    if (selectedAgents.includes("all")) {
      onSelectAgents(selectedAgents.filter((id) => id !== "all"))
    } else {
      onSelectAgents(["all"])
    }
  }

  return (
    <Card className="border border-primary/30 neon-box overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-secondary bg-opacity-10">
        <CardTitle className="font-rajdhani text-white">COMPARE PREDICTIONS</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-all">
            <Checkbox
              id="all"
              checked={selectedAgents.includes("all")}
              onCheckedChange={() => handleAllToggle()}
              className="border-accent text-accent"
            />
            <Label htmlFor="all" className="cursor-pointer font-exo">
              All Agents
            </Label>
          </div>

          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-all"
            >
              <Checkbox
                id={agent.id}
                checked={selectedAgents.includes(agent.id)}
                onCheckedChange={() => handleAgentToggle(agent.id)}
                className="border-accent text-accent"
                disabled={selectedAgents.includes("all")}
              />
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-white`}>
                  {getAgentIcon(agent.id)}
                </div>
                <Label
                  htmlFor={agent.id}
                  className={`cursor-pointer font-exo ${selectedAgents.includes("all") ? "text-muted-foreground" : ""}`}
                >
                  {agent.name}
                </Label>
              </div>
            </div>
          ))}

          {/* Add agent icon legend */}
          {selectedAgents.length > 1 && !selectedAgents.includes("all") && (
            <div className="mt-4 pt-4 border-t border-primary/30">
              <p className="text-xs text-muted-foreground mb-2">Icon Legend:</p>
              <div className="grid grid-cols-2 gap-2">
                {agents
                  .filter((agent) => selectedAgents.includes(agent.id))
                  .map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center bg-secondary/80 text-white`}
                      >
                        {getAgentIcon(agent.id)}
                      </div>
                      <span>{agent.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

