"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAgentData } from "@/hooks/use-agent-data"
import { Settings } from "lucide-react"

export function SiteNav() {
  const pathname = usePathname()
  const { agents, isLoading } = useAgentData()

  if (isLoading) return null

  return (
    <nav className="bg-black border-b border-primary/30 py-3 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-orbitron text-white text-lg">
            NCAA BRACKET
          </Link>

          <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar">
            <Link
              href="/"
              className={`px-3 py-1 rounded-md text-sm font-exo transition-colors ${
                pathname === "/" ? "bg-primary/20 text-accent" : "text-white hover:bg-primary/10"
              }`}
            >
              Overview
            </Link>

            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className={`px-3 py-1 rounded-md text-sm font-exo transition-colors whitespace-nowrap ${
                  pathname === `/agents/${agent.id}` ? "bg-primary/20 text-accent" : "text-white hover:bg-primary/10"
                }`}
              >
                {agent.name}
              </Link>
            ))}

            <div className="border-l border-primary/30 h-6 mx-1"></div>

            <Link
              href="/admin/game-mapping"
              className={`px-3 py-1 rounded-md text-sm font-exo transition-colors whitespace-nowrap ${
                pathname === "/admin/game-mapping" ? "bg-primary/20 text-accent" : "text-white hover:bg-primary/10"
              }`}
            >
              Game Mapping
            </Link>

            <Link
              href="/admin/api-status"
              className={`px-3 py-1 rounded-md text-sm font-exo transition-colors whitespace-nowrap flex items-center gap-1 ${
                pathname === "/admin/api-status" ? "bg-primary/20 text-accent" : "text-white hover:bg-primary/10"
              }`}
            >
              <Settings className="w-3 h-3" /> API Status
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

