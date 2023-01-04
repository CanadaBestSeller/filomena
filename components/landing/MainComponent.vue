<template>
  <div>
    <!--  Center the landing component-->
    <b-jumbotron class="text-center m-0 bg-transparent">
      <h1 class="mt-5 mb-2">
        {{ $t('landing.title') }}
      </h1>

      <FunctionalAuthFirebaseUser>
        <template #user="{ user }">
          <div v-if="user"><i18n class="mx-4 mb-4" path="landing.welcomeBack" tag="h5">{{ user.displayName }}</i18n></div>
          <div v-else><h5 class="mx-4 mb-4">{{ $t('landing.subtitle') }}</h5></div>
        </template>
      </FunctionalAuthFirebaseUser>

      <b-button class="shadow" size="lg" @click="joinParty()" variant="primary">{{ $t('landing.joinParty') }}</b-button>
      <b-button class="shadow" size="lg" @click="startParty()" variant="outline-success">{{ $t('landing.startParty') }}</b-button>
    </b-jumbotron>

    <LandingIntroComponent />
    <LandingHowToPlay />

  </div>
</template>

<script>
export default {
  methods: {
    joinParty () {
      return 42 // TODO implement method
    },
    startParty () {
      this.$router.push('/start')
    }
  }
}
</script>
