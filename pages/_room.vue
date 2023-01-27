<template>
  <RoomMainComponent :roomId="$nuxt.$route.path.substring(1).toUpperCase()" />
</template>

<script>
import { auth } from '~/db/firebase'

export default {
  name: 'RoomPage',
  head() {
    return {
      title: this.$nuxt.$route.path.substring(1).toUpperCase()
    }
  },
}
</script>
