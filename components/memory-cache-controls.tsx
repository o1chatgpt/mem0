"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { mem0Client, type CacheConfig } from "@/lib/mem0-client"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Trash2, Save, Database, Link } from "lucide-react"

export function MemoryCacheControls() {
  const [cacheConfig, setCacheConfig] = useState<CacheConfig>(mem0Client.getCacheConfig())
  const [cacheStats, setCacheStats] = useState({
    memoriesHits: 0,
    memoriesMisses: 0,
    statsHits: 0,
    statsMisses: 0,
    memoryHits: 0,
    memoryMisses: 0,
    suggestionsHits: 0,
    suggestionsMisses: 0,
  })
  const [ttlMinutes, setTtlMinutes] = useState(cacheConfig.ttl / (60 * 1000))

  // Update cache config when controls change
  const updateCacheConfig = (updates: Partial<CacheConfig>) => {
    const newConfig = { ...cacheConfig, ...updates }
    setCacheConfig(newConfig)
    mem0Client.setCacheConfig(newConfig)
  }

  // Handle TTL slider change
  const handleTtlChange = (value: number[]) => {
    const ttlMin = value[0]
    setTtlMinutes(ttlMin)
    updateCacheConfig({ ttl: ttlMin * 60 * 1000 })
  }

  // Clear cache
  const handleClearCache = () => {
    mem0Client.clearCache()
    setCacheStats({
      memoriesHits: 0,
      memoriesMisses: 0,
      statsHits: 0,
      statsMisses: 0,
      memoryHits: 0,
      memoryMisses: 0,
      suggestionsHits: 0,
      suggestionsMisses: 0,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Memory Cache Controls
        </CardTitle>
        <CardDescription>Configure and monitor the memory caching system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="stats">Cache Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cache-enabled" className="text-base">
                    Cache Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">Enable or disable the memory cache system</p>
                </div>
                <Switch
                  id="cache-enabled"
                  checked={cacheConfig.enabled}
                  onCheckedChange={(checked) => updateCacheConfig({ enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="cache-ttl" className="text-base">
                  Cache TTL: {ttlMinutes} minutes
                </Label>
                <p className="text-sm text-muted-foreground mb-2">Time to live for cached items before they expire</p>
                <Slider
                  id="cache-ttl"
                  min={1}
                  max={60}
                  step={1}
                  value={[ttlMinutes]}
                  onValueChange={handleTtlChange}
                  disabled={!cacheConfig.enabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cache-persist" className="text-base">
                    Persist to LocalStorage
                  </Label>
                  <p className="text-sm text-muted-foreground">Save cache between browser sessions</p>
                </div>
                <Switch
                  id="cache-persist"
                  checked={cacheConfig.persistToLocalStorage}
                  onCheckedChange={(checked) => updateCacheConfig({ persistToLocalStorage: checked })}
                  disabled={!cacheConfig.enabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Memories List</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      Hits: {cacheStats.memoriesHits}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50">
                      Misses: {cacheStats.memoriesMisses}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Memory Stats</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      Hits: {cacheStats.statsHits}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50">
                      Misses: {cacheStats.statsMisses}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Individual Memories</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      Hits: {cacheStats.memoryHits}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50">
                      Misses: {cacheStats.memoryMisses}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Suggestions</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      Hits: {cacheStats.suggestionsHits}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50">
                      Misses: {cacheStats.suggestionsMisses}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                Cache statistics are reset when the page is refreshed or the cache is cleared.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          Clear Cache
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => mem0Client.saveCacheToLocalStorage?.()}
            disabled={!cacheConfig.persistToLocalStorage}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Cache
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/cache-analytics" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              View Analytics
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
