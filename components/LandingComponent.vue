<template>
  <!--  Center the landing component-->
  <b-jumbotron class="text-center m-0 bg-transparent">
    <h1 class="mb-2">
      {{ $t('landing.title') }}
    </h1>

    <h5 class="mx-4 mb-4">
      {{ $t('landing.subtitle') }}
    </h5>

    <b-button class="shadow" size="lg" variant="primary">{{ $t('landing.joinParty') }}</b-button>
    <b-button class="shadow" size="lg" variant="outline-success">{{ $t('landing.startParty') }}</b-button>

    <IntroComponent />

  </b-jumbotron>
</template>
