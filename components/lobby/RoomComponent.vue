<template>
  <div>
    <!--  Center the landing component-->
    <b-jumbotron class="text-center m-0 bg-transparent">
      <h1 class="mt-5 mb-2">
        {{ this.$route.params.room }}
      </h1>

      <b-spinner class="lg" variant="primary" type="grow"/>
    </b-jumbotron>
  </div>
</template>

<script>
</script>
