<template>
  <!--  Top-level div should justify all content in the middle-->
  <div id="top-level" class="d-flex justify-content-center">

    <!-- Vertically center the main component-->
    <div class="d-flex align-items-center">
      <Nuxt />
    </div>

    <!-- Footer-->
    <FooterComponent />

  </div>
</template>

<style>
/* Nuxt does not entirely fill up the top-level div out-of-the box - need to manually fill up vertically */
#__layout > div {
  min-height: 100vh;
}
</style>
