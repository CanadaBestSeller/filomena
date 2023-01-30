<template>
  <div class="d-flex align-items-center" style="display: inline-block">
    <h3>
      {{ questionText }}
      <b-link v-if="!hasRatedQuestion" class="rating-emoji mb-2 text-decoration-none" @click="loveQuestionLocally" v-b-tooltip.hover.v-success :title="loveQuestionText">❤️</b-link>
      <b-link v-if="!hasRatedQuestion" class="rating-emoji mb-2 text-decoration-none" @click="dislikeQuestionLocally" v-b-tooltip.hover.v-danger :title="dislikeQuestionText">👎</b-link>
    </h3>
  </div>
</template>

<script>
import { dislikeQuestion, loveQuestion } from '~/lib/firebase_gateway'

export default {
  data() {
    return {
      hasRatedQuestion: false
    }
  },

  computed: {
    loveQuestionText() { return this.$t('game.loveQuestion') },
    dislikeQuestionText() { return this.$t('game.dislikeQuestion') },
  },

  methods: {
    loveQuestionLocally() { loveQuestion(this.questionId); this.hasRatedQuestion = true },
    dislikeQuestionLocally() { dislikeQuestion(this.questionId); this.hasRatedQuestion = true }
  },

  props: [
    'questionText',
    'questionId'
  ]
}
</script>

<style>
.rating-emoji {
  font-size: 1.2rem;
  vertical-align: top;
  opacity: 0.5;
}

.rating-emoji:hover { opacity: 1; }
</style>
