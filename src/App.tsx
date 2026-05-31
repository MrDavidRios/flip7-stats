import { useEffect, useState } from "react"
import "./App.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { AppHeader } from "@/components/AppHeader"
import { CalendarTab } from "@/components/CalendarTab"
import { PlayersTab } from "@/components/PlayersTab"
import { getAllPlayers, getGameDates, type Data } from "@/lib/data"

function App() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="container">
        <AppHeader fetchedAt="" />
        <p className="text-destructive">Could not load data: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container">
        <AppHeader fetchedAt="" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const players = getAllPlayers(data)
  const games = getGameDates(data)

  return (
    <div className="container">
      <AppHeader fetchedAt={data.fetchedAt} />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarTab games={games} />
        </TabsContent>
        <TabsContent value="players">
          <PlayersTab players={players} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
