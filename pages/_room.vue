<template>
  <RoomMainComponent :roomId="$nuxt.$route.path.substring(1).toUpperCase()" />
</template>

<script>
export default {
  name: 'RoomPage',
}
</script>
