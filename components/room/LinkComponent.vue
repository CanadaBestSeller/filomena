<template>
  <div>
    <b-img @click="goHome" class="d-none d-sm-block panda-face-img m-2" src="~/assets/images/panda-wink-2.png"/>
    <div class="shadow-sm bg-light pt-2 pb-1 d-flex flex-column justify-content-center room-link-div text-center">
      <p style="font-family: 'Cera Round Pro Bold', sans-serif" class="my-0 mx-auto">{{ $t('lobby.inviteFriends') }}</p>
      <b-link ref="roomLink" @click="copyLinkToClipboard()" class="room-link mx-auto">
        {{ roomLink }}
      </b-link>
      <p class="my-0 mx-auto" v-if="copied" style="font-family: 'Cera Round Pro Bold', sans-serif">{{ $t('general.copied') }}</p>
      <p class="my-0 mx-auto width-au" v-else @click="copyLinkToClipboard()">{{ $t('general.clickToCopyToClipboard') }}</p>
    </div>
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
    roomLink () { return 'panda.up.railway.app/' + this.roomId },
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
    },

    goHome() { this.$router.push('/') },
  },

  props: [
    'roomId'
  ]
}
</script>

<style>
.panda-face-img {
  z-index: 2;
  height: 4.5rem;
  position: fixed;
  top: 0;
  left: 0;
  cursor: pointer;
}

.room-link-div {
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);
}

.room-link {
  font-family: "Cera Round Pro Bold", sans-serif;
  font-size: 1.5rem;
}
</style>
