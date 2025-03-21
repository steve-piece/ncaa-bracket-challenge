"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { testApiConnection } from "@/lib/sportradar-api"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function ApiStatusPage() {
  const [apiStatus, setApiStatus] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [envDebug, setEnvDebug] = useState<{[key: string]: string | undefined}>({})
  
  // Use a fallback if env variable is undefined
  const USE_MOCK_DATA = 
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === undefined ? 
    true : // Default to true if not defined
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  useEffect(() => {
    // Check if the API key is set and not the placeholder
    const key = process.env.SPORTRADAR_API_KEY
    if (key && key !== "your_api_key_here") {
      // Only show first 4 and last 4 characters of the key
      setApiKey(`${key.substring(0, 4)}...${key.substring(key.length - 4)}`)
    } else {
      setApiKey(null)
    }
    
    // Collect environment variable debugging info
    setEnvDebug({
      NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
      SPORTRADAR_API_KEY_SET: process.env.SPORTRADAR_API_KEY ? 'yes' : 'no',
      MOCK_DATA_PARSED: String(USE_MOCK_DATA)
    });
  }, [])

  const checkApiStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await testApiConnection()
      setApiStatus(status)
      setLastChecked(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setApiStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <main className="min-h-screen bg-black cyberpunk-grid">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="neon-glow mb-2 glitch-text" data-text="API STATUS">
            API STATUS
          </h1>
          <div className="h-1 w-48 bg-gradient-primary mx-auto my-6 rounded-full animate-glow-pulse"></div>
          <h2 className="text-accent font-rajdhani">SPORTRADAR API DIAGNOSTICS</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border border-primary/30 neon-box overflow-hidden mb-8">
            <CardHeader className="pb-2 bg-gradient-primary bg-opacity-10">
              <CardTitle className="font-rajdhani text-white">API CONNECTION STATUS</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {apiStatus === null ? (
                    <Badge className="bg-muted text-muted-foreground">Checking...</Badge>
                  ) : apiStatus ? (
                    <Badge className="bg-green-500/20 text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/20 text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Disconnected
                    </Badge>
                  )}
                  {lastChecked && (
                    <span className="text-sm text-muted-foreground">
                      Last checked: {lastChecked.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <Button onClick={checkApiStatus} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Check Again
                    </>
                  )}
                </Button>
              </div>

              {/* API Key Status */}
              <div className="mb-4 p-3 bg-muted/10 rounded-md">
                <h3 className="font-medium text-white mb-1">API Key Status:</h3>
                <div className="flex items-center gap-2">
                  {apiKey ? (
                    <Badge className="bg-green-500/20 text-green-500">API Key Configured</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-500">API Key Not Configured</Badge>
                  )}
                  {apiKey && <span className="text-sm text-muted-foreground">Key: {apiKey}</span>}
                </div>
              </div>

              {/* Mock Data Status */}
              <div className="mb-4 p-3 bg-muted/10 rounded-md">
                <h3 className="font-medium text-white mb-1">Mock Data Status:</h3>
                <div className="flex items-center gap-2">
                  {USE_MOCK_DATA ? (
                    <Badge className="bg-blue-500/20 text-blue-500">Using Mock Data</Badge>
                  ) : (
                    <Badge className="bg-purple-500/20 text-purple-500">Using Real API Data</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {USE_MOCK_DATA 
                      ? "The app is configured to use mock data regardless of API status." 
                      : "The app will try to use real API data when available."}
                  </span>
                </div>
              </div>

              {/* Environment Debug Info */}
              <div className="mb-4 p-3 bg-muted/10 rounded-md">
                <h3 className="font-medium text-white mb-1">Environment Variables Debug:</h3>
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(envDebug, null, 2)}
                </pre>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-sm">
                  <p className="font-medium text-destructive mb-1">Error Details:</p>
                  <p className="font-mono text-xs">{error}</p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <h3 className="font-exo text-lg text-accent">Troubleshooting Steps</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Verify that your Sportradar API key is correctly configured in the .env.local file.</li>
                  <li>Ensure you've replaced "your_api_key_here" with an actual API key from Sportradar.</li>
                  <li>Check that your API key has access to the NCAA Men's Basketball endpoints.</li>
                  <li>Make sure you've subscribed to the NCAA Men's Basketball API on the Sportradar Developer Portal.</li>
                  <li>If using mock data, set NEXT_PUBLIC_USE_MOCK_DATA=true in your .env.local file.</li>
                  <li>If using real data, set NEXT_PUBLIC_USE_MOCK_DATA=false in your .env.local file.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/30 neon-box overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-secondary bg-opacity-10">
              <CardTitle className="font-rajdhani text-white">MOCK DATA SETTINGS</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm">
                  The application is currently configured to {USE_MOCK_DATA ? "use" : "not use"} mock data by default.
                  This setting can be changed in your <code>.env.local</code> file by updating the
                  <code>NEXT_PUBLIC_USE_MOCK_DATA</code> environment variable.
                </p>

                <div className="p-4 bg-muted/20 border border-muted/30 rounded-md font-mono text-xs">
                  <pre>
                    # Flag to enable mock data when API is unavailable{"\n"}
                    NEXT_PUBLIC_USE_MOCK_DATA={USE_MOCK_DATA.toString()}{"\n"}
                    {"\n"}
                    # Sportradar API Key{"\n"}
                    SPORTRADAR_API_KEY="your_actual_api_key"
                  </pre>
                </div>

                <p className="text-sm">
                  When mock data is enabled, the application will display "-" for all scores instead of actual
                  data. This indicates that real data is not available. All matches will show as "scheduled" status
                  rather than showing in-progress or completed status. This configuration is useful during development
                  when real API data is unavailable.
                </p>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                  <h4 className="font-medium text-blue-400 mb-2">API Rate Limits</h4>
                  <p className="text-xs">
                    Note that the Sportradar trial API has rate limits (typically 1 request per second and up to 1000 requests per month).
                    If you exceed these limits, API calls will fail with a 403 error. Consider using mock data during development
                    to avoid hitting these limits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

