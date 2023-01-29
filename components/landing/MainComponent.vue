<template>
  <div>

    <b-alert v-if="$route.params.invalidRoomId" variant="danger" dismissible fade :show="5" style="z-index: 100" class="text-center position-fixed fixed-top m-0 rounded-0" >
      {{ $t('lobby.roomDoesNotExist', [$route.params.invalidRoomId]) }}
    </b-alert>

    <b-container class="mt-4">
      <b-row class="d-flex justify-content-center align-items-center">
        <b-col cols="auto" class="d-flex justify-content-center px-2">
          <b-img class="title-image mt-3 mb-0" src="~/assets/images/panda-smile-face-only-3.png"/>
        </b-col>
        <b-col cols="auto">
          <b-row><b-col><h1 class="m-0 text-center">{{ $t('landing.title') }}</h1></b-col></b-row>
          <b-row><b-col><h5 class="m-0 text-center">{{ $t('landing.subtitle') }}</h5></b-col></b-row>
        </b-col>
      </b-row>

      <b-row class="my-3" align-h="center" no-gutters>
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

<style>
@media (max-width: 389px) { .title-image { max-height: 4rem } }
@media (min-width: 390px) and (max-width: 768px) { .title-image { max-height: 6rem } }
@media (min-width: 769px) { .title-image { max-height: 9rem } }
</style>
