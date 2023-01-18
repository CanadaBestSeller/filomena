<template>
  <div>
    <RoomLinkComponent :roomId="roomId"/>


    <!-- FINISHED SCREEN -->
    <div v-cloak v-if="f.roomDoc.gameStatus === 'FINISHED'">
      <h1>oooWe're done! 🎊</h1>
      <h5>oooThe Winning Answer Is....</h5>
    </div>


    <!-- ANSWER SCREEN, entering answer-->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'ANSWER' && !answered">
      <h1>
        {{ currentQuestion }}
      </h1>

      <h2><b-badge :variant="answerTimerVariant">{{ answerTimerCount }}</b-badge></h2>

      <b-input-group>
        <b-form-input v-model="answerUi.newAnswerText" @keyup.enter="answerQuestionLocally"/>
        <b-input-group-append>
          <b-button variant="primary" type="text" @click="answerQuestionLocally">{{ $t('general.sendMessage') }}</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>


    <!-- ANSWER SCREEN, entered answer-->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'ANSWER' && answered">
      <h1>
        oooWaiting for others to answer...
      </h1>
    </div>


    <!-- VOTE SCREEN, not voted -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && !voted">
      <h1>
        {{ currentQuestion }}
      </h1>

      <h2><b-badge :variant="voteTimerVariant">{{ voteTimerCount }}</b-badge></h2>

      <div>
        <b-form-group v-slot="{ ariaDescribedby }">
          <b-form-radio v-for="answer in f.roomDoc.questions[f.roomDoc.currentQuestionIndex].answers" :key="answer.uid"
                        v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="vote-group"
                        :value="answer.uid" :disabled="answer.uid === f.user.uid">
                        {{ answer.text }}
          </b-form-radio>
        </b-form-group>

        <div>Selected: <strong>{{ voteRadioOption }}</strong></div>
      </div>

      <b-button variant="primary" :disabled="!voteRadioOption" @click="voteLocally">oooVote</b-button>
    </div>


    <!-- VOTE SCREEN, voted -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && voted">
      <h1>
        oooWaiting for others to vote...
      </h1>
    </div>


    <!-- SUMMARY SCREEN, no vote at all -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length === 0">
      <h3>{{ currentQuestion }}</h3>
      <h1>oooThere were no votes!</h1>
      <h2><b-badge :variant="summaryTimerVariant">{{ summaryTimerCount }}</b-badge></h2>
    </div>


    <!-- SUMMARY SCREEN, one winning vote -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length === 1">
      <h3>{{ currentQuestion }}</h3>
      <h5>oooThe Winning Answer Is....</h5>
      <h1>{{ currentWinningAnswers[0].text }}</h1>
      <h4>{{ currentWinningAnswers[0].votes }} oooVotes</h4>
      <h3>{{ f.roomDoc.players.find(p => p.uid === currentWinningAnswers[0].uid).name }}</h3>
      <h2><b-badge :variant="summaryTimerVariant">{{ summaryTimerCount }}</b-badge></h2>
    </div>


    <!-- SUMMARY SCREEN, many winning votes -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length > 1">
      <h3>{{ currentQuestion }}</h3>
      <h5>oooIt's a tie!</h5>

      <b-list-group>
        <b-list-group-item v-for="answer in currentWinningAnswers" :key="answer.uid">
          "{{ answer.text }}" - {{ f.roomDoc.players.find(p => p.uid === answer.uid).name }} ({{ answer.votes }} oooVotes)
        </b-list-group-item>
      </b-list-group>

      <h2><b-badge :variant="summaryTimerVariant">{{ summaryTimerCount }}</b-badge></h2>
    </div>


    <!-- ERROR SCREEN, catch-all -->
    <div v-cloak v-else><h1>😬😬😬</h1></div>

  </div>
</template>

<script>
import {
  answerQuestion,
  getCurrentTimeEpochSec,
  transitionAfterVote,
  transitionAfterAnswer,
  voteForAnswer, transitionAfterSummary
} from '@/lib/firebase_gateway'

export default {

  created() {
    setInterval(() => { this.totalPlayTime++ }, 1000);

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
      voteRadioOption: null,

      summaryTimerCount: -1,
    }
  },

  computed: {
    currentQuestion() {
      const currentQuestion = this.f.roomDoc.questions[this.f.roomDoc.currentQuestionIndex]
      return this.$t(currentQuestion.id, [currentQuestion.subject1, currentQuestion.subject2])
    },

    answerTimerVariant() { return this.answerTimerCount <= 5 ? 'danger' : this.answerTimerCount <= 15 ? 'warning' : 'success' },
    answerTimerEmoji() { return this.answerTimerCount <= 5 ? '😱' : this.answerTimerCount <= 15 ? '😬' : '🤔' },
    answered() { return this.f.roomDoc.questions[this.f.roomDoc.currentQuestionIndex].answers.some(a => a.uid === this.f.user.uid)},

    currentWinningAnswers() {
      const answers = this.f.roomDoc.questions[this.f.roomDoc.currentQuestionIndex].answers
      const winningAnswers = []

      let highestVoteCount = 0  // First: iterate through answers and find highestVoteCount
      for (let i = 0; i < answers.length; i++) {
        if (answers[i].votes > highestVoteCount) { highestVoteCount = answers[i].votes }
      }

      // Second: get all answers with the highestVoteCount
      for (let i = 0; i < answers.length; i++) {
        if (answers[i].votes === highestVoteCount) { winningAnswers.push(answers[i]) }
      }
      return winningAnswers
    },

    voteTimerVariant() { return this.voteTimerCount <= 5 ? 'info' : this.voteTimerCount <= 15 ? 'info' : 'info' },
    voteTimerEmoji() { return this.voteTimerCount <= 5 ? '😱' : this.voteTimerCount <= 15 ? '😬' : '🤔' },

    summaryTimerVariant() { return this.answerTimerCount <= 5 ? 'secondary' : this.answerTimerCount <= 15 ? 'secondary' : 'secondary' },
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
    },

    async voteLocally() {
      await voteForAnswer(this.f.roomDocRef, this.voteRadioOption)
      this.voted = true
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

    summaryTimerCount: {
      handler(value) {
        if (this.f.roomDoc.gameStatus === 'SUMMARY' && value > 0) {
          setTimeout(() => { this.summaryTimerCount-- }, 1000)
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    'f.roomDoc.gameStatus': {  // Transition based on participation (e.g. All players have answered)
      async handler(newStatus, oldStatus) {
        if (oldStatus === 'ANSWER' && newStatus === 'VOTE') {
          await transitionAfterAnswer(this.f.roomDocRef)
          this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
        }

        if (oldStatus === 'VOTE' && newStatus === 'SUMMARY') {
          await transitionAfterVote(this.f.roomDocRef)
          this.summaryTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
          this.voted = false
          this.voteTimerCount = -1
          this.voteRadioOption = null
        }
      }
    },

    totalPlayTime: {  // Transition based on time - this is a hack to check the time every second
      async handler(newPlayTime, oldPlayTime) {
        if (this.f.roomDoc.gameStatus === 'ANSWER' && getCurrentTimeEpochSec() >= this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredAnswerTimeLimitSec) {
          await transitionAfterAnswer(this.f.roomDocRef)
          this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
        }

        if (this.f.roomDoc.gameStatus === 'VOTE' && getCurrentTimeEpochSec() >= this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) {
          await transitionAfterVote(this.f.roomDocRef)
          this.summaryTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
          this.voted = false
          this.voteTimerCount = -1
          this.voteRadioOption = null
        }

        if (this.f.roomDoc.gameStatus === 'SUMMARY' && getCurrentTimeEpochSec() >= this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) {
          await transitionAfterSummary(this.f.roomDocRef, this.f.roomDoc)
          this.answerTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredAnswerTimeLimitSec) - getCurrentTimeEpochSec()
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
