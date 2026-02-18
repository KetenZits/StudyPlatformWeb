'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import BannedPage from '../../components/BannedPage'
import { ToastProvider } from '../../components/Toast'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

// Ban check wrapper — shows BannedPage if user is banned
function BanCheck({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()
  const currentUser = useQuery(api.users.getCurrentUser)

  // Not signed in or still loading → render children normally
  if (!isSignedIn || currentUser === undefined || currentUser === null) {
    return <>{children}</>
  }

  // User is banned → show ban page
  if (currentUser.banned) {
    return <BannedPage />
  }

  return <>{children}</>
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ToastProvider>
        <BanCheck>
          {children}
        </BanCheck>
      </ToastProvider>
    </ConvexProviderWithClerk>
  )
}