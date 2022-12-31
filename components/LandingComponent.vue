<template>
  <!--  Center the landing component-->
  <b-jumbotron class="text-center bg-transparent">
    <template #header>Filomena</template>

    <template #lead>
      A free lighthearted game for the virtual office 🥳
    </template>

    <!-- There's a bug with animation, so we're using no-animation-->
    <b-carousel
      class="mb-3"
      no-animation
      :interval="0"
      controls
      indicators
      img-width="600"
      img-height="200"
      background="#ababab"
    >
      <!-- Slides with custom text -->
      <b-carousel-slide img-blank>
        <!-- TODO add image about # of players, time required, and mobile+browser-->
        <h6>Have fun and connect with your remote colleagues!</h6>
      </b-carousel-slide>

      <b-carousel-slide img-blank>
        <h6>Step 1: Answer whimsical questions about each other</h6>
      </b-carousel-slide>

      <b-carousel-slide img-blank>
        <h6>Step 2: Vote on the best answer, winner gets points</h6>
      </b-carousel-slide>

      <b-carousel-slide img-blank>
        <h6>Step 3: Tally up the points and play again!</h6>
      </b-carousel-slide>
    </b-carousel>

    <b-button class="shadow" size="lg" variant="primary" href="#">Join Party 👋</b-button>
    <b-button class="shadow" size="lg" variant="outline-success" href="#">Start Party 🌱</b-button>
  </b-jumbotron>
</template>

<style>
.btn {
  margin: 0.2rem;
  border-radius: 1rem;
}
.carousel-caption {
  top: 50%;
  transform: translateY(-45%);
  bottom: initial;
}
.carousel-indicators > .active {
  background-color: var(--primary);
}
</style>
