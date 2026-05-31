import { Button as ShadcnButton, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

type ButtonProps = ComponentProps<typeof ShadcnButton> & VariantProps<typeof buttonVariants>

export function Button(props: ButtonProps) {
  return <ShadcnButton {...props} />
}
