<template>
  <div>

    <b-alert v-if="$route.params.invalidRoomId" variant="danger" dismissible fade :show="5" style="z-index: 100" class="text-center position-fixed fixed-top m-0 rounded-0" >
      {{ $t('lobby.roomDoesNotExist', [$route.params.invalidRoomId]) }}
    </b-alert>

    <b-container class="mt-5">
      <b-row><b-col><h1 class="text-center">{{ $t('landing.title') }}</h1></b-col></b-row>
      <b-row><b-col><h5 class="text-center">{{ $t('landing.subtitle') }}</h5></b-col></b-row>

      <b-row class="my-4" align-h="center" no-gutters>
        <b-col cols="auto"><b-button class="shadow mx-1" size="lg" @click="joinParty()" variant="primary">{{ $t('landing.joinParty') }}</b-button></b-col>
        <b-col cols="auto"><b-button class="shadow mx-1" size="lg" @click="startParty()" variant="outline-success">{{ $t('landing.startParty') }}</b-button></b-col>
      </b-row>
    </b-container>

    <LandingIntroComponent />
    <LandingHowToPlay />

  </div>
</template>

<script>
export default {
  methods: {
    joinParty () {
      this.$router.push('/enter')
    },
    startParty () {
      this.$router.push('/start')
    }
  }
}
</script>
