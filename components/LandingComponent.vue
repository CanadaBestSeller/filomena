<template>
  <!--  Center the landing component-->
  <b-jumbotron class="text-center bg-transparent">
    <template #header>Filomena</template>

    <template #lead>
      {{ $t('landing.description') }}
    </template>

    <b-button class="shadow" size="lg" variant="primary">{{ $t('landing.joinParty') }}</b-button>
    <b-button class="shadow" size="lg" variant="outline-success">{{ $t('landing.startParty') }}</b-button>

  </b-jumbotron>
</template>

<style>
</style>
