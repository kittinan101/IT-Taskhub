import AppLayout from "@/components/layout/app-layout"
import { Providers } from "@/components/providers"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <AppLayout>{children}</AppLayout>
    </Providers>
  )
}