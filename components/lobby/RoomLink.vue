<template>
  <div class="room-link-div text-center bg-transparent">
    <b-link ref="roomLink" @click="copyLinkToClipboard()" class="room-link">
      {{ roomLink }}
    </b-link>
    <p v-if="copied" class="my-1"><b>{{ $t('general.copied') }}</b></p>
    <p v-else @click="copyLinkToClipboard()" class="my-1">{{ $t('general.clickToCopyToClipboard') }}</p>
  </div>
</template>

<script>
export default {

  data() {
    return {
      copied: false
    }
  },

  methods: {
    copyLinkToClipboard () {
      navigator.clipboard.writeText(this.roomLink)

      const roomLinkRef = this.$refs.roomLink
      roomLinkRef.$el.style.transition = 'all 0.3s ease-out'
      roomLinkRef.$el.style.opacity = .3
      this.copied = true
      setTimeout(() => {
        roomLinkRef.$el.style.transition = 'all 0.3s ease-out'
        roomLinkRef.$el.style.opacity = 1
      }, 300)
      setTimeout(() => { this.copied = false }, 1000)
    }
  },

  props: [
    'roomLink'
  ]
}
</script>

<style>
.room-link-div {
  margin: 0;
}

.room-link {
  font-family: "Cera Round Pro Bold", sans-serif;
  font-size: 1.5rem;
}
</style>
