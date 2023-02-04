<template>
  <div class="my-1 text-center m-0">
    <b-link id="popover-target">
      <h4>{{ $t('game.scoreboard') }}</h4>
    </b-link>

    <b-popover class="shadow" target="popover-target" triggers="hover" placement="bottom">
      <b-list-group v-for="player in orderedPlayersWithTotalPoints" :key="player.uid" class="mt-2 mb-1 mx-0 text-center">
        <b-list-group-item class="d-flex flex-row p-1 m-0 align-items-center border-0 bg-transparent">
          <h3 class="m-0">{{ player.emoji }}</h3>
          <span class="ml-2 mr-4">{{ player.name }}</span>
          <b-badge class="ml-auto" pill variant="primary">{{ player.totalPoints }}</b-badge>
        </b-list-group-item>
      </b-list-group>
    </b-popover>

  </div>
</template>

<script>
import { getOrderedPlayersWithTotalPoints } from '~/lib/firebase_gateway'

export default {
  computed: {
    orderedPlayersWithTotalPoints() {
      return getOrderedPlayersWithTotalPoints(this.f.roomDoc)
    },
  },
  props: [
    'f'
  ]
}
</script>

<style>
.popover {
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
</style>
