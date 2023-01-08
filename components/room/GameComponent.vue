<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>


    <div v-cloak v-if="firebase.roomDoc.gameStatus === 'ANSWER'">
      <h1 class="mt-5 mb-2">
        {{ $t(firebase.roomDoc.questions[0].id) }}
      </h1>

      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>

      <b-input-group>
        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestion"/>
        <b-input-group-append>
          <b-button variant="primary" type="text" @click="answerQuestion">{{ $t('general.sendMessage') }}</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>


    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'VOTE'">
      <h1 class="mt-5 mb-2">
        oooVote for the best answer!
      </h1>

      <div>
        <b-form-group label="Individual radios" v-slot="{ ariaDescribedby }">
          <b-form-radio v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="some-radios" value="A">Option A</b-form-radio>
          <b-form-radio v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="some-radios" value="B">Option B</b-form-radio>
        </b-form-group>

        <div class="mt-3">Selected: <strong>{{ voteRadioOption }}</strong></div>
      </div>
    </div>

    <!--    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'SUMMARY'">-->
<!--      <h1 class="mt-5 mb-2">-->
<!--        {{ $t(firebase.roomDoc.questions[0].id) }}-->
<!--      </h1>-->

<!--      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>-->

<!--      <b-input-group>-->
<!--        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestion"/>-->
<!--        <b-input-group-append>-->
<!--          <b-button variant="primary" type="text" @click="answerQuestion">{{ $t('general.sendMessage') }}</b-button>-->
<!--        </b-input-group-append>-->
<!--      </b-input-group>-->
<!--    </div>-->


    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'FINISHED'"><h1>🎊</h1></div>

    <div v-cloak v-else><h1>😬</h1></div>

  </div>
</template>

<script>
import { answerQuestion, getCurrentTimeEpochSec, transitionToVote } from '@/lib/firebase_gateway'

export default {

  created() {
    this.answerTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + 30) - getCurrentTimeEpochSec()
  },

  data() {
    return {
      answerUi: { newAnswerText: '' },
      answerTimerCount: -1,
      voteRadioOption: '',
    }
  },

  computed: {
    answerTimerVariant() { return this.answerTimerCount <= 5 ? 'danger' : this.answerTimerCount <= 15 ? 'warning' : 'success' },
    answerTimerEmoji() { return this.answerTimerCount <= 5 ? '😱' : this.answerTimerCount <= 15 ? '😬' : '🤔' }
  },

  props: [
    'roomId',
    'firebase',
  ],

  methods: {
    async answerQuestion() {
      const answerText = this.answerUi.newAnswerText
      this.answerUi.newAnswerText = ''
      await answerQuestion(this.firebase.roomDocRef, answerText, this.firebase.user.uid)
    },

    getCurrentQuestion() {
      const currentQuestionIndex = this.firebase.roomDoc.currentQuestionIndex
      return this.firebase.roomDoc.questions[currentQuestionIndex]
    }
  },

  watch: {
    answerTimerCount: {
      handler(value) {  // TODO need to check logic here
        if (this.firebase.roomDoc.gameStatus === 'ANSWER' && value > 0) {
          setTimeout(() => { this.answerTimerCount-- }, 1000)
        } else if (this.firebase.roomDoc.gameStatus === 'ANSWER' && value === 0) {
          answerQuestion(this.firebase.roomDocRef, null, this.firebase.user.uid)  // Will transition to vote
        } else {
          // Do nothing
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    'firebase.roomDoc': {
      async handler(value) {
        if (value.gameStatus === 'ANSWER' && value.questions[this.firebase.roomDoc.currentQuestionIndex].answers.length === this.firebase.roomDoc.players.length) {
          await transitionToVote(this.firebase.roomDocRef)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },


  }
}
</script>

<style>
button[type="text"] { margin: 0; border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
</style>
