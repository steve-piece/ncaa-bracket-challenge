import { Suspense } from "react"
import BracketDashboard from "@/components/bracket-dashboard"
import { LoadingBracket } from "@/components/loading-bracket"

export default function Home() {
  return (
    <main className="min-h-screen bg-black cyberpunk-grid">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="neon-glow mb-2 glitch-text" data-text="2025 NCAA BRACKET CHALLENGE">
            2025 NCAA BRACKET CHALLENGE
          </h1>
          <div className="h-1 w-48 bg-gradient-primary mx-auto my-6 rounded-full animate-glow-pulse"></div>
          <h2 className="text-accent font-rajdhani">AI AGENTS PREDICTION BATTLE</h2>
        </div>

        <div className="bg-black/50 border border-primary/30 rounded-lg p-6 mb-8">
          <h3 className="font-exo text-xl text-accent mb-4">Welcome to the 2025 NCAA Bracket Challenge</h3>
          <p className="text-muted-foreground mb-4">
            This platform showcases how different AI agents predict the outcomes of the 2025 NCAA Basketball Tournament.
            Use the navigation bar above to explore each agent's predictions and performance.
          </p>
          <p className="text-muted-foreground">
            Select an agent from the leaderboard below or use the navigation menu to view detailed predictions.
          </p>
        </div>

        <Suspense fallback={<LoadingBracket />}>
          <BracketDashboard />
        </Suspense>
      </div>
    </main>
  )
}

