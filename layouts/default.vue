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
#__layout > div {
  min-height: 100vh;
}

#top-level {
  background-color: rgba(27, 190, 37, 0.361);
}
</style>
