import {
  Tabs as ShadcnTabs,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  TabsContent as ShadcnTabsContent,
  tabsListVariants,
} from "@/components/ui/tabs"
import type { ComponentProps } from "react"

type TabsProps = ComponentProps<typeof ShadcnTabs>
type TabsListProps = ComponentProps<typeof ShadcnTabsList>
type TabsTriggerProps = ComponentProps<typeof ShadcnTabsTrigger>
type TabsContentProps = ComponentProps<typeof ShadcnTabsContent>

export function Tabs(props: TabsProps) {
  return <ShadcnTabs {...props} />
}

export function TabsList(props: TabsListProps) {
  return <ShadcnTabsList {...props} />
}

export function TabsTrigger(props: TabsTriggerProps) {
  return <ShadcnTabsTrigger {...props} />
}

export function TabsContent(props: TabsContentProps) {
  return <ShadcnTabsContent {...props} />
}

export { tabsListVariants }
