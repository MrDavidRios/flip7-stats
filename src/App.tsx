import { useEffect, useMemo, useState } from "react"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
import "./App.css"
import { AppHeader } from "@/components/AppHeader"
import { CalendarTab } from "@/components/CalendarTab"
import { PlayersTab } from "@/components/PlayersTab"
import { PlayerDashboard } from "@/components/PlayerDashboard"
import { GameDetailView } from "@/components/GameDetailView"
import { getAllPlayers, getGameDates, type Data } from "@/lib/data"
import { cn } from "@/lib/utils"

function TabNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-foreground/60 hover:text-foreground"
    )

  return (
    <nav className="inline-flex w-fit items-center justify-center rounded-lg bg-muted p-[3px] h-8 mb-6">
      <NavLink to="/" end className={linkClass}>
        Calendar
      </NavLink>
      <NavLink to="/players" end className={linkClass}>
        Players
      </NavLink>
    </nav>
  )
}

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

  const players = useMemo(() => (data ? getAllPlayers(data) : []), [data])
  const games = useMemo(() => (data ? getGameDates(data) : []), [data])

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

  return (
    <div className="container">
      <AppHeader fetchedAt={data.fetchedAt} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <TabNav />
              <CalendarTab games={games} />
            </>
          }
        />
        <Route
          path="/players"
          element={
            <>
              <TabNav />
              <PlayersTab players={players} />
            </>
          }
        />
        <Route
          path="/players/:name"
          element={<PlayerDashboard data={data} />}
        />
        <Route
          path="/games/:index"
          element={<GameDetailView data={data} games={games} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
