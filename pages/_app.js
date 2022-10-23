import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import {  QueryClient, QueryClientProvider } from '@tanstack/react-query'
function MyApp({ Component, pageProps, session }) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}

export default MyApp
