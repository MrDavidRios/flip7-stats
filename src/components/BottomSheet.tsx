import { Drawer } from "@base-ui/react/drawer"
import type { ReactNode } from "react"

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
  title: string
  children: ReactNode
}

export function BottomSheet({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/30 opacity-100 transition-opacity duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup className="w-full max-w-lg translate-y-(--drawer-swipe-movement-y) rounded-t-2xl border border-b-0 border-foreground/10 bg-card px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.35)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:translate-y-full data-starting-style:translate-y-full data-swiping:duration-0">
            <div aria-hidden className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-foreground/20" />
            <Drawer.Title className="mb-2 text-center text-sm font-medium text-foreground">
              {title}
            </Drawer.Title>
            {children}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
