<template>
  <div class="my-1 text-center m-0 bg-transparent">
    <b-link id="popover-target">
      {{ $t('howToPlay.howToPlay') }}
      <BIconQuestionCircleFill variant="dark" />
    </b-link>

    <b-popover target="popover-target" triggers="hover" placement="bottom">
      <b-list-group class="mt-2 mb-1 mx-0 text-center">
        <b-list-group-item class="p-1 m-0 border-left-0 border-right-0 border-top-0 bg-transparent">{{ $t('howToPlay.step1') }}</b-list-group-item>
        <b-list-group-item class="p-1 m-0 border-left-0 border-right-0 bg-transparent">{{ $t('howToPlay.step2') }}</b-list-group-item>
        <b-list-group-item class="p-1 m-0 border-left-0 border-right-0 border-bottom-0 bg-transparent">{{ $t('howToPlay.step3') }}</b-list-group-item>
      </b-list-group>
    </b-popover>

  </div>
</template>

<script>
import { BIconQuestionCircleFill } from 'bootstrap-vue'

export default {
  components: {
    BIconQuestionCircleFill
  }
}
</script>

<style>
.popover {
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
</style>
