import { useEffect, useMemo, useState } from "react"
import { Routes, Route, NavLink, Navigate, Outlet } from "react-router-dom"
import { motion, MotionConfig, type Transition } from "motion/react"
import "./App.css"
import { AppHeader } from "@/components/AppHeader"
import { CalendarTab } from "@/components/CalendarTab"
import { PlayersTab } from "@/components/PlayersTab"
import { StatsTab } from "@/components/StatsTab"
import { PlayerDashboard } from "@/components/PlayerDashboard"
import { GameDetailView } from "@/components/GameDetailView"
import { TooltipProvider } from "@/components/Tooltip"
import { getAllPlayers, getGameDates, type Data } from "@/lib/data"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/", label: "Calendar" },
  { to: "/players", label: "Players" },
  { to: "/stats", label: "Stats" },
]

// Slide the active pill between tabs, matching the players reorder spring.
const pillTransition: Transition = { type: "spring", duration: 0.35, bounce: 0 }

function TabNav() {
  return (
    <MotionConfig reducedMotion="user" transition={pillTransition}>
      <nav className="flex w-full items-center justify-center rounded-lg bg-muted p-[3px] h-11 mb-6 md:inline-flex md:w-fit md:h-8">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              cn(
                "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="tab-nav-pill"
                    className="absolute -inset-px rounded-md bg-background shadow-sm"
                  />
                )}
                <span className="relative">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </MotionConfig>
  )
}

function TabsLayout() {
  return (
    <>
      <TabNav />
      <Outlet />
    </>
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
    <TooltipProvider>
      <div className="container">
        <AppHeader fetchedAt={data.fetchedAt} />
        <Routes>
          <Route element={<TabsLayout />}>
            <Route path="/" element={<CalendarTab games={games} />} />
            <Route path="/players" element={<PlayersTab players={players} />} />
            <Route path="/stats" element={<StatsTab data={data} />} />
          </Route>
          <Route
            path="/players/:name"
            element={<PlayerDashboard data={data} />}
          />
          <Route
            path="/games/:spreadsheetId/:gid"
            element={<GameDetailView data={data} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </TooltipProvider>
  )
}

export default App
