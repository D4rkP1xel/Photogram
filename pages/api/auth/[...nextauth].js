import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
export const authOptions = {
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
  ],
  secret: process.env.JWT_SECRET //watch another video about google provider, i think they use a token to login rather than a callback page
}
export default NextAuth(authOptions)