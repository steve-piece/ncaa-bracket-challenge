import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchAgents } from "@/lib/api"
import { LoadingBracket } from "@/components/loading-bracket"
import BracketDashboard from "@/components/bracket-dashboard"

export async function generateStaticParams() {
  const agents = await fetchAgents()
  return agents.map((agent) => ({
    agentId: agent.id,
  }))
}

export async function generateMetadata({ params }: { params: { agentId: string } }) {
  const agents = await fetchAgents()
  const agent = agents.find((a) => a.id === params.agentId)

  if (!agent) {
    return {
      title: "Agent Not Found",
    }
  }

  return {
    title: `${agent.name} - NCAA Bracket Predictions`,
    description: `View ${agent.name}'s predictions for the 2025 NCAA Basketball Tournament`,
  }
}

export default async function AgentPage({ params }: { params: { agentId: string } }) {
  const agents = await fetchAgents()
  const agent = agents.find((a) => a.id === params.agentId)

  if (!agent) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black cyberpunk-grid">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="neon-glow mb-2 glitch-text" data-text={`${agent.name.toUpperCase()} PREDICTIONS`}>
            {agent.name.toUpperCase()} PREDICTIONS
          </h1>
          <div className="h-1 w-48 bg-gradient-primary mx-auto my-6 rounded-full animate-glow-pulse"></div>
          <h2 className="text-accent font-rajdhani">2025 NCAA BRACKET CHALLENGE</h2>
        </div>

        <div className="bg-black/50 border border-primary/30 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-primary/50 overflow-hidden flex items-center justify-center bg-gradient-primary">
              <img src={agent.avatar || "/placeholder.svg"} alt={agent.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-exo text-2xl">{agent.name}</h3>
              <p className="text-muted-foreground">
                Score: <span className="text-accent font-orbitron">{agent.score}</span> • Correct Picks:{" "}
                <span className="text-accent font-orbitron">{agent.correctPicks}</span>
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            This page will display {agent.name}'s bracket predictions and performance statistics. Check back soon for
            detailed analysis and visualization of this agent's picks.
          </p>
        </div>

        <Suspense fallback={<LoadingBracket />}>
          <BracketDashboard initialAgent={params.agentId} />
        </Suspense>
      </div>
    </main>
  )
}

