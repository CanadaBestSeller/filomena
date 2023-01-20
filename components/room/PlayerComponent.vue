<template>
  <div>

    <h2 class="text-center mt-5">{{ $t('lobby.players') }}</h2>

    <b-container class="bv-example-row">
      <b-row no-gutters cols="2" cols-sm="3" cols-md="3" cols-lg="4" cols-xl="4">
        <b-col v-for="player in f.roomDoc.players" :key="player.uid">

          <div class="d-flex flex-column justify-content-center align-content-center">
            <p class="text-center lobby-avatar-emoji">{{ player.emoji }}</p>
            <p class="text-center lobby-avatar-name">{{ player.name }}</p>
          </div>

        </b-col>
      </b-row>
    </b-container>

  </div>
</template>

<script>
export default {
  props: [
    'f',
  ],
}
</script>

<style>
.lobby-avatar-emoji {
  font-size: 5rem;
  margin-bottom: -1rem;
}

.lobby-avatar-emoji .dark-mode {
  font-size: 5rem;
  margin-bottom: -1rem;
}

.lobby-avatar-name {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
