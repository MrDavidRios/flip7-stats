interface AppHeaderProps {
  fetchedAt: string
}

export function AppHeader({ fetchedAt }: AppHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Flip 7 Stats
      </h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date(fetchedAt).toLocaleString()}
      </p>
    </header>
  )
}
