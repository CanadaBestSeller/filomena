<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>


    <div v-cloak v-if="f.roomDoc.gameStatus === 'ANSWER' && !answered">
      <h1 class="mt-5 mb-2">
        {{ $t(f.roomDoc.questions[f.roomDoc.currentQuestionIndex].id) }}
      </h1>

      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>

      <b-input-group>
        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestionLocally"/>
        <b-input-group-append>
          <b-button variant="primary" type="text" @click="answerQuestionLocally">{{ $t('general.sendMessage') }}</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>


    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'ANSWER' && answered">
      <h1 class="mt-5 mb-2">
        oooWaiting for others to answer...
      </h1>
    </div>


    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && !voted">
      <h1 class="mt-5 mb-2">
        {{ $t(f.roomDoc.questions[f.roomDoc.currentQuestionIndex].id) }}
      </h1>

      <h2><b-badge :variant="voteTimerVariant">{{ voteTimerCount }}</b-badge></h2>

      <div>
        <b-form-group v-slot="{ ariaDescribedby }">
          <b-form-radio v-for="answer in f.roomDoc.questions[f.roomDoc.currentQuestionIndex].answers" :key="answer.uid"
                        v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="vote-group"
                        :value="answer.uid">
<!--            :disabled="answer.uid === f.user.uid">-->
                          {{ answer.text }}
          </b-form-radio>
        </b-form-group>

        <div class="mt-3">Selected: <strong>{{ voteRadioOption }}</strong></div>
      </div>

      <b-button variant="primary" @click="voteLocally">{{ $t('general.sendMessage') }}</b-button>
    </div>


    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && voted">
      <h1 class="mt-5 mb-2">
        oooWaiting for others to vote...
      </h1>
    </div>

<!--    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY'">-->
<!--      <h1 class="mt-5 mb-2">-->
<!--        {{ $t(f.roomDoc.questions[0].id) }}-->
<!--      </h1>-->

<!--      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>-->

<!--      <b-input-group>-->
<!--        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestion"/>-->
<!--        <b-input-group-append>-->
<!--          <b-button variant="primary" type="text" @click="answerQuestion">{{ $t('general.sendMessage') }}</b-button>-->
<!--        </b-input-group-append>-->
<!--      </b-input-group>-->
<!--    </div>-->


    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'FINISHED'"><h1>🎊</h1></div>

    <div v-cloak v-else><h1>😬😬😬</h1></div>

  </div>
</template>

<script>
import { answerQuestion, getCurrentTimeEpochSec, transitionToVote, voteForAnswer } from '@/lib/firebase_gateway'

export default {

  created() {
    setInterval(() => {this.totalPlayTime += 900; console.log(`incremented totalPlayTime ${this.totalPlayTime}`) }, 1000);

    if (!this.answered) {
      this.answerTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredAnswerTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.f.roomDoc.gameStatus === 'VOTE') {
      this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.f.roomDoc.gameStatus === 'SUMMARY') {
      this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
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
    answered() { return this.f.roomDoc.questions[this.f.roomDoc.currentQuestionIndex].answers.some(a => a.uid === this.f.user.uid)},

    voteTimerVariant() { return this.voteTimerCount <= 5 ? 'info' : this.voteTimerCount <= 15 ? 'info' : 'info' },
    voteTimerEmoji() { return this.voteTimerCount <= 5 ? '😱' : this.voteTimerCount <= 15 ? '😬' : '🤔' },
  },

  props: [
    'roomId',
    'f',
  ],

  methods: {
    async answerQuestionLocally() {
      const answerText = this.answerUi.newAnswerText
      this.answerUi.newAnswerText = ''
      await answerQuestion(this.f.roomDocRef, answerText, this.f.user.uid)
      this.answerTimerCount = -1
    },

    async voteLocally() {
      await voteForAnswer(this.f.roomDocRef, this.voteRadioOption)
    },

    getCurrentQuestion() {
      const currentQuestionIndex = this.f.roomDoc.currentQuestionIndex
      return this.f.roomDoc.questions[currentQuestionIndex]
    }
  },

  watch: {
    answerTimerCount: {
      handler(value) {
        if (this.f.roomDoc.gameStatus === 'ANSWER' && value > 0) {
          setTimeout(() => { this.answerTimerCount-- }, 1000)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    voteTimerCount: {
      handler(value) {
        if (this.f.roomDoc.gameStatus === 'VOTE' && value > 0) {
          setTimeout(() => { this.voteTimerCount-- }, 1000)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    totalPlayTime: {  // Hack to check the time every second
      async handler(newPlayTime, oldPlayTime) {
        if (this.f.roomDoc.gameStatus === 'ANSWER' && getCurrentTimeEpochSec() >= this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredAnswerTimeLimitSec) {
          console.log("ANSWER EXPIRED")
          await transitionToVote(this.f.roomDocRef)
          this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
        }

        if (this.f.roomDoc.gameStatus === 'VOTE' && getCurrentTimeEpochSec() >= this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) {
          await transitionToSummary(this.f.roomDocRef)
          this.summaryTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
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
