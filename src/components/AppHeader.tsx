interface AppHeaderProps {
  fetchedAt: string
}

export function AppHeader({ fetchedAt }: AppHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-3xl font-florence tracking-tight text-foreground flex items-center">
        FLIP<span className="text-5xl pr-2 -ml-2 mr-1.5 italic">7</span> STATS
      </p>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date(fetchedAt).toLocaleString()}
      </p>
    </header>
  )
}
