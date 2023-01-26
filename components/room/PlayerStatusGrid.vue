<template>

    <b-container>
      <b-row class="justify-content-center" no-gutters cols="4" cols-sm="5" cols-md="6" cols-lg="7" cols-xl="8">
<!--        TODO implement sort-->
        <b-col v-for="player in f.roomDoc.players" :key="player.uid">

          <div class="d-flex my-2 flex-column justify-content-center align-content-center">
            <h3 v-cloak class="text-center" style="margin-bottom: -.25rem">{{ player.emoji }}</h3>

            <h5 v-cloak v-if="player.uid === f.user.uid" class="text-primary text-center my-1">{{ $t('lobby.you', [player.name]) }}</h5>
            <h5 v-cloak v-else class="text-center my-1">{{ player.name }}</h5>

            <b-badge class="m-auto" pill variant="primary">{{ player.points }}</b-badge>
          </div>

        </b-col>
      </b-row>
    </b-container>

</template>

<script>
export default {
  props: [
    'f',
  ],
}
</script>
