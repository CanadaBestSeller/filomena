/**
 * Logic to redirect to the auth page at '/hello' if the user is not authenticated.
 * '/hello' and its associated AuthHelloComponent will need to know:
 * 1. The context of the auth, so the page can render some friendly, contextual UI, AND
 * 2. Which page to revisit AFTER auth is complete, therefore we expose the destination as a parameter
 * @param firebase firebase
 * @param authContext Use the AuthContext class in this file
 * @param destination The route to be pushed to after auth is complete
 * @returns {Promise<void>}
 */
export async function redirectIfUnauthenticated(firebaseAuth, authContext, metadata, destination) {
  const user = firebaseAuth.currentUser
  if (!user) {
    console.log("Not authenticated, redirecting")
    const routeParams = {
      authContext: authContext,
      destination: destination,
      metadata: metadata
    }
    await $nuxt.$router.push({ name: '/hello', params: routeParams })
  } else {
    console.log("Authenticated. Good to go.")
  }
}

export const AuthContext = {
  START: 0,
  JOIN: 1,
  ROOM: 2
}
