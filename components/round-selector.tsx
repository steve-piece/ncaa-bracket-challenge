"use client"

import { animate } from "motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Round {
  id: number
  name: string
}

interface RoundSelectorProps {
  rounds: Round[]
  selectedRound: number
  onSelectRound: (round: number) => void
}

export function RoundSelector({ rounds, selectedRound, onSelectRound }: RoundSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="font-rajdhani text-accent mb-3">SELECT TOURNAMENT ROUND</h3>
      <Tabs
        value={selectedRound.toString()}
        onValueChange={(value) => onSelectRound(Number.parseInt(value))}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 bg-black border border-primary/30 p-1 neon-box">
          {rounds.map((round) => (
            <TabsTrigger
              key={round.id}
              value={round.id.toString()}
              className="relative font-exo data-[state=active]:text-accent data-[state=active]:shadow-none"
            >
              {selectedRound === round.id && (
                <div
                  className="absolute inset-0 bg-gradient-primary opacity-20 rounded-md"
                  ref={(el) => {
                    if (el)
                      animate(
                        el,
                        { scale: [0.9, 1], opacity: [0.5, 0.2] },
                        { duration: 0.5, easing: [0.34, 1.56, 0.64, 1] },
                      )
                  }}
                />
              )}
              <span className="relative z-10">{round.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

