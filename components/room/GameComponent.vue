<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>


    <div v-cloak v-if="firebase.roomDoc.gameStatus === 'ANSWER' && !answered">
      <h1 class="mt-5 mb-2">
        {{ $t(firebase.roomDoc.questions[firebase.roomDoc.currentQuestionIndex].id) }}
      </h1>

      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>

      <b-input-group>
        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestionLocally"/>
        <b-input-group-append>
          <b-button variant="primary" type="text" @click="answerQuestionLocally">{{ $t('general.sendMessage') }}</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>


    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'ANSWER' && answered">
      <h1 class="mt-5 mb-2">
        oooWaiting for others to answer...
      </h1>
    </div>


    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'VOTE' && !voted">
      <h1 class="mt-5 mb-2">
        {{ $t(firebase.roomDoc.questions[firebase.roomDoc.currentQuestionIndex].id) }}
      </h1>

      <h2><b-badge :variant="voteTimerVariant">{{ voteTimerCount }}</b-badge></h2>

      <div>
        <b-form-group v-slot="{ ariaDescribedby }">
          <b-form-radio v-for="answer in firebase.roomDoc.questions[firebase.roomDoc.currentQuestionIndex].answers" :key="answer.uid"
                        v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="vote-group"
                        :value="answer.uid">
<!--            :disabled="answer.uid === firebase.user.uid">-->
                          {{ answer.text }}
          </b-form-radio>
        </b-form-group>

        <div class="mt-3">Selected: <strong>{{ voteRadioOption }}</strong></div>
      </div>

      <b-button variant="primary" @click="voteLocally">{{ $t('general.sendMessage') }}</b-button>
    </div>


    <div v-cloak v-else-if="firebase.roomDoc.gameStatus === 'VOTE' && voted">
      <h1 class="mt-5 mb-2">
        oooWaiting for others to vote...
      </h1>
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

    <div v-cloak v-else><h1>😬😬😬</h1></div>

  </div>
</template>

<script>
import { answerQuestion, getCurrentTimeEpochSec, transitionToVote, voteForAnswer } from '@/lib/firebase_gateway'

export default {

  created() {
    setInterval(() => {this.totalPlayTime += 900; console.log(`incremented totalPlayTime ${this.totalPlayTime}`) }, 1000);

    if (!this.answered) {
      this.answerTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredAnswerTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.firebase.roomDoc.gameStatus === 'VOTE') {
      this.voteTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.firebase.roomDoc.gameStatus === 'SUMMARY') {
      this.voteTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
    }
  },

  data() {
    return {
      totalPlayTime: -1,

      answerTimerCount: -1,
      answerUi: { newAnswerText: '' },

      voted: false,  // This should really be kept at the firestore level, but if someone wants to refresh and vote again, whatevs
      voteTimerCount: -1,
      voteRadioOption: '',
    }
  },

  computed: {
    answerTimerVariant() { return this.answerTimerCount <= 5 ? 'danger' : this.answerTimerCount <= 15 ? 'warning' : 'success' },
    answerTimerEmoji() { return this.answerTimerCount <= 5 ? '😱' : this.answerTimerCount <= 15 ? '😬' : '🤔' },
    answered() { return this.firebase.roomDoc.questions[this.firebase.roomDoc.currentQuestionIndex].answers.some(a => a.uid === this.firebase.user.uid)},

    voteTimerVariant() { return this.voteTimerCount <= 5 ? 'info' : this.voteTimerCount <= 15 ? 'info' : 'info' },
    voteTimerEmoji() { return this.voteTimerCount <= 5 ? '😱' : this.voteTimerCount <= 15 ? '😬' : '🤔' },
  },

  props: [
    'roomId',
    'firebase',
  ],

  methods: {
    async answerQuestionLocally() {
      const answerText = this.answerUi.newAnswerText
      this.answerUi.newAnswerText = ''
      await answerQuestion(this.firebase.roomDocRef, answerText, this.firebase.user.uid)
      this.answerTimerCount = -1
    },

    async voteLocally() {
      await voteForAnswer(this.firebase.roomDocRef, this.voteRadioOption)
    },

    getCurrentQuestion() {
      const currentQuestionIndex = this.firebase.roomDoc.currentQuestionIndex
      return this.firebase.roomDoc.questions[currentQuestionIndex]
    }
  },

  watch: {
    answerTimerCount: {
      handler(value) {
        if (this.firebase.roomDoc.gameStatus === 'ANSWER' && value > 0) {
          setTimeout(() => { this.answerTimerCount-- }, 1000)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    voteTimerCount: {
      handler(value) {
        if (this.firebase.roomDoc.gameStatus === 'VOTE' && value > 0) {
          setTimeout(() => { this.voteTimerCount-- }, 1000)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    totalPlayTime: {  // Hack to check the time every second
      async handler(newPlayTime, oldPlayTime) {
        if (this.firebase.roomDoc.gameStatus === 'ANSWER' && getCurrentTimeEpochSec() >= this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredAnswerTimeLimitSec) {
          console.log("ANSWER EXPIRED")
          await transitionToVote(this.firebase.roomDocRef)
          this.voteTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
        }

        if (this.firebase.roomDoc.gameStatus === 'VOTE' && getCurrentTimeEpochSec() >= this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredVoteTimeLimitSec) {
          await transitionToSummary(this.firebase.roomDocRef)
          this.summaryTimerCount = (this.firebase.roomDoc.currentGameStatusTimestampEpochSec + this.firebase.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
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
