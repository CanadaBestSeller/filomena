<template>
  <div class="my-3 d-flex flex-column justify-content-center room-link-div text-center">
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

  computed: {
    roomLink () { return 'thumbs.up.railway.app/' + this.roomId },
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
    'roomId'
  ]
}
</script>

<style>
.room-link-div {
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 1;
}

.room-link {
  font-family: "Cera Round Pro Bold", sans-serif;
  font-size: 1.5rem;
}
</style>
