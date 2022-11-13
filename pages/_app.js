import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import {  QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function MyApp({ Component, pageProps, session }) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp
