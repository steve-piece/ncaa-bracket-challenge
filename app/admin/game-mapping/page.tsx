import GameIdMapper from "@/components/game-id-mapper"

export default function GameMappingPage() {
  return (
    <main className="min-h-screen bg-black cyberpunk-grid">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="neon-glow mb-2 glitch-text" data-text="GAME ID MAPPING">
            GAME ID MAPPING
          </h1>
          <div className="h-1 w-48 bg-gradient-primary mx-auto my-6 rounded-full animate-glow-pulse"></div>
          <h2 className="text-accent font-rajdhani">SPORTRADAR API INTEGRATION</h2>
        </div>

        <div className="bg-black/50 border border-primary/30 rounded-lg p-6 mb-8">
          <h3 className="font-exo text-xl text-accent mb-4">Map Sportradar Game IDs to NCAA Bracket Challenge</h3>
          <p className="text-muted-foreground mb-4">
            Use this utility to map Sportradar game IDs to our internal match IDs. This will enable live score updates
            from the Sportradar API.
          </p>
          <p className="text-muted-foreground">
            1. Select a tournament round and load matches
            <br />
            2. Paste the Sportradar daily schedule JSON and parse it
            <br />
            3. Match the game IDs and generate the mapping code
            <br />
            4. Copy the code and update the GAME_ID_MAPPING in app/api/scores/route.ts
          </p>
        </div>

        <GameIdMapper />
      </div>
    </main>
  )
}

