import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingBracket() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border border-primary/30 neon-box overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-primary bg-opacity-10">
            <Skeleton className="h-6 w-40 bg-primary/20" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-primary/20" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1 bg-primary/20" />
                        <Skeleton className="h-3 w-16 bg-primary/10" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-12 bg-accent/20" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 neon-box overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-secondary bg-opacity-10">
            <Skeleton className="h-6 w-40 bg-primary/20" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-accent/20" />
                    <Skeleton className="h-4 w-28 bg-primary/20" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <div className="mb-6">
          <Skeleton className="h-10 w-full rounded-md bg-primary/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="border border-primary/30 neon-box overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-32 mb-4 bg-accent/20" />
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full bg-primary/20" />
                    <Skeleton className="h-2 w-8 mx-auto bg-secondary/20" />
                    <Skeleton className="h-16 w-full bg-primary/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

