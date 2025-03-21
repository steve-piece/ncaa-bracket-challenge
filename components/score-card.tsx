"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Round {
  id: number
  name: string
}

interface ScoreCardProps {
  rounds: Round[]
}

export function ScoreCard({ rounds }: ScoreCardProps) {
  // ESPN scoring system: 10 * 2^(n-1) points per round
  const getPointsForRound = (roundId: number) => {
    return 10 * Math.pow(2, roundId - 1)
  }

  return (
    <Card className="border border-primary/30 neon-box overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-primary bg-opacity-10">
        <CardTitle className="font-rajdhani text-white">SCORING SYSTEM</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/30">
              <TableHead className="font-exo text-accent">Round</TableHead>
              <TableHead className="text-right font-exo text-accent">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round) => (
              <TableRow key={round.id} className="border-b border-primary/20 hover:bg-primary/5">
                <TableCell className="font-exo">{round.name}</TableCell>
                <TableCell className="text-right font-orbitron text-secondary">{getPointsForRound(round.id)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3 font-sans">
          ESPN scoring system: 10 × 2^(n-1) points per correct pick in each round
        </p>
      </CardContent>
    </Card>
  )
}

