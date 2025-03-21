import Link from "next/link"

export default function AgentNotFound() {
  return (
    <main className="min-h-screen bg-black cyberpunk-grid">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="neon-glow mb-2 glitch-text" data-text="AGENT NOT FOUND">
            AGENT NOT FOUND
          </h1>
          <div className="h-1 w-48 bg-gradient-primary mx-auto my-6 rounded-full animate-glow-pulse"></div>
          <h2 className="text-accent font-rajdhani">2025 NCAA BRACKET CHALLENGE</h2>
        </div>

        <div className="bg-black/50 border border-primary/30 rounded-lg p-6 mb-8 text-center">
          <p className="text-muted-foreground mb-6">
            The agent you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary/20 hover:bg-primary/30 text-accent font-exo rounded-md transition-colors"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </main>
  )
}

