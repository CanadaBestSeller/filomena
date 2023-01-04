<template>
  <div>
    <!--  Center the landing component-->
    <b-jumbotron class="text-center m-0 bg-transparent">
      <h1 class="mt-5 mb-2">
        {{ $t('start.creatingRoom') }}
      </h1>

      <FunctionalAuthFirebaseUser>
        <template #user="{ user }">
          <div v-if="user"><i18n class="mx-4 mb-4" path="landing.welcomeBack" tag="h5">{{ user.displayName }}</i18n></div>
        </template>
      </FunctionalAuthFirebaseUser>

      <b-spinner class="lg" variant="primary" type="grow"/>
    </b-jumbotron>
  </div>
</template>

<script>
</script>
