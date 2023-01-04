<template>
  <LobbyRoomComponent />
</template>

<script>
import { auth } from '@/db/firebase'
import { AuthContext } from '~/lib/redirect'

export default {
  name: 'RoomPage',
  middleware(context) {
    console.log('inside start middleware')

    const user = auth.currentUser
    if (!user) {
      console.log("Not authenticated, redirecting")
      const routeParams = {
        authContext: AuthContext.START,
        destination: context.route.params.room,
        metadata: null
      }
      context.app.router.push({ name: 'hello', params: routeParams })

    } else {
      console.log("Authenticated. Good to go.")
    }
  }
}
</script>
