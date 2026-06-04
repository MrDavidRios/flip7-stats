import { useEffect, useState } from "react"
import "./App.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { AppHeader } from "@/components/AppHeader"
import { CalendarTab } from "@/components/CalendarTab"
import { PlayersTab } from "@/components/PlayersTab"
import { PlayerDashboard } from "@/components/PlayerDashboard"
import { GameDetailView } from "@/components/GameDetailView"
import { getAllPlayers, getGameDates, type Data, type GameSummary } from "@/lib/data"

interface SelectedGame {
  name: string
  spreadsheetLabel: string
}

function App() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null)

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

  const handleSelectGame = (game: GameSummary) => {
    setSelectedGame({ name: game.name, spreadsheetLabel: game.spreadsheetLabel })
  }

  if (selectedPlayer) {
    return (
      <div className="container">
        <AppHeader fetchedAt={data.fetchedAt} />
        <PlayerDashboard
          playerName={selectedPlayer}
          data={data}
          onBack={() => setSelectedPlayer(null)}
        />
      </div>
    )
  }

  if (selectedGame) {
    return (
      <div className="container">
        <AppHeader fetchedAt={data.fetchedAt} />
        <GameDetailView
          gameName={selectedGame.name}
          spreadsheetLabel={selectedGame.spreadsheetLabel}
          data={data}
          onBack={() => setSelectedGame(null)}
        />
      </div>
    )
  }

  const players = getAllPlayers(data)
  const games = getGameDates(data)

  return (
    <div className="container">
      <AppHeader fetchedAt={data.fetchedAt} />

      <Tabs defaultValue="calendar">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarTab games={games} onSelectGame={handleSelectGame} />
        </TabsContent>
        <TabsContent value="players">
          <PlayersTab
            players={players}
            onSelectPlayer={setSelectedPlayer}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
