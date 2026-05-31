import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardFooter as ShadcnCardFooter,
  CardTitle as ShadcnCardTitle,
  CardAction as ShadcnCardAction,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent,
} from "@/components/ui/card"
import type { ComponentProps } from "react"

type CardProps = ComponentProps<typeof ShadcnCard>
type CardHeaderProps = ComponentProps<typeof ShadcnCardHeader>
type CardFooterProps = ComponentProps<typeof ShadcnCardFooter>
type CardTitleProps = ComponentProps<typeof ShadcnCardTitle>
type CardActionProps = ComponentProps<typeof ShadcnCardAction>
type CardDescriptionProps = ComponentProps<typeof ShadcnCardDescription>
type CardContentProps = ComponentProps<typeof ShadcnCardContent>

export function Card(props: CardProps) {
  return <ShadcnCard {...props} />
}

export function CardHeader(props: CardHeaderProps) {
  return <ShadcnCardHeader {...props} />
}

export function CardFooter(props: CardFooterProps) {
  return <ShadcnCardFooter {...props} />
}

export function CardTitle(props: CardTitleProps) {
  return <ShadcnCardTitle {...props} />
}

export function CardAction(props: CardActionProps) {
  return <ShadcnCardAction {...props} />
}

export function CardDescription(props: CardDescriptionProps) {
  return <ShadcnCardDescription {...props} />
}

export function CardContent(props: CardContentProps) {
  return <ShadcnCardContent {...props} />
}
