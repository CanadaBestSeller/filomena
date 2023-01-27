<template>
  <div class="game-div">
    <RoomLinkComponent :roomId="roomId"/>


    <!-- FINISHED SCREEN -->
    <div v-cloak v-if="f.roomDoc.gameStatus === 'FINISHED'" class="container-sm text-center">
      <div class="d-flex justify-content-center m-2"><b-img class="wait-image m-0" src="~/assets/images/panda-flag.png"/></div>
      <h3>{{ $t('game.gameOver') }}</h3>
      <h2 class="my-2">{{ $t('game.winnerIs', [getWinningPlayerWithTotalPoints().name, getWinningPlayerWithTotalPoints().emoji]) }}</h2>
      <RoomPlayerStatusPopover :f="f" class="mb-5"/>
    </div>


    <!-- ANSWER SCREEN, entering answer-->
    <div id="answering-div" v-cloak class="container-sm text-center" v-else-if="f.roomDoc.gameStatus === 'ANSWER' && !answered">
      <h2>{{ currentQuestion }}</h2>

      <b-badge pill :variant="answerTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [answerTimerCount]) }}</h6></b-badge>

      <b-form @submit.prevent="answerQuestionLocally">
        <b-form-input class="my-3 text-center" id="form-input-answer" placeholder="📝" maxLength="320" v-model="answerUi.newAnswerText" @keyup.enter="answerQuestionLocally"/>
        <b-button class="shadow mx-1" type="submit" size="lg" variant="primary" @click="answerQuestionLocally" :disabled="!answerUi.newAnswerText">{{ $t('game.answer', [answerTimerEmoji]) }}</b-button>
      </b-form>
    </div>


    <!-- ANSWER SCREEN, entered answer-->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'ANSWER' && answered" class="container-sm text-center">
      <div class="d-flex justify-content-center m-2"><b-img class="wait-image m-0" src="~/assets/images/panda-sleeping-2.png"/></div>
      <h3>{{ $t('game.waitingAnswer') }}</h3>
      <b-badge pill :variant="answerTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [answerTimerCount]) }}</h6></b-badge>
    </div>


    <!-- VOTE SCREEN, not voted -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && !voted" class="container-sm text-center">
      <h2>{{ currentQuestion }}</h2>

      <b-badge pill :variant="voteTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [voteTimerCount]) }}</h6></b-badge>

      <div class="my-3">
        <b-form-group v-slot="{ ariaDescribedby }">
          <b-form-radio v-for="answer in f.roomDoc.questions[f.roomDoc.currentQuestionIndex].answers" :key="answer.uid"
                        v-model="voteRadioOption" :aria-describedby="ariaDescribedby" name="vote-group"
                        :value="answer.uid" :disabled="answer.uid === f.user.uid">
                        {{ answer.text }}
          </b-form-radio>
        </b-form-group>
      </div>

      <b-button class="shadow mx-1" size="lg" variant="primary" @click="voteLocally" :disabled="!voteRadioOption">{{ $t('game.vote') }}</b-button>
    </div>


    <!-- VOTE SCREEN, voted -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'VOTE' && voted" class="container-sm text-center">
      <div class="d-flex justify-content-center m-2"><b-img class="wait-image m-0" src="~/assets/images/panda-sleeping-1.png"/></div>
      <h3>{{ $t('game.waitingVote') }}</h3>
      <b-badge pill :variant="voteTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [voteTimerCount]) }}</h6></b-badge>
    </div>


    <!-- SUMMARY SCREEN, no vote at all -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length === 0" class="container-sm text-center">
      <h3>{{ currentQuestion }}</h3>
      <h1>oooThere were no votes!</h1>
      <RoomPlayerStatusPopover :f="f" class="my-2"/>
      <b-badge pill :variant="summaryTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [summaryTimerCount]) }}</h6></b-badge>
    </div>


    <!-- SUMMARY SCREEN, one winning vote -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length === 1" style="overflow-y: auto; max-height: 60vh;">

      <div class="container-sm text-center">
        <h3>{{ currentQuestion }}</h3>
        <h5>{{ $t('game.winningAnswerIs') }}</h5>

        <h2 class="mt-5 mb-0"><i>"{{ currentWinningAnswers[0].text }}"</i></h2>
        <h4 class="mt-0 mb-5">
          - {{ f.roomDoc.players.find(p => p.uid === currentWinningAnswers[0].uid).name }} ({{ $t('game.votes', [currentWinningAnswers[0].votes]) }})
        </h4>

        <RoomPlayerStatusPopover :f="f" class="my-2"/>
        <b-badge pill :variant="summaryTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [summaryTimerCount]) }}</h6></b-badge>

      </div>

    </div>


    <!-- SUMMARY SCREEN, many winning votes -->
    <div v-cloak v-else-if="f.roomDoc.gameStatus === 'SUMMARY' && currentWinningAnswers.length > 1" class="container-sm text-center">
      <h3>{{ currentQuestion }}</h3>
      <h5>oooIt's a tie!</h5>

      <b-list-group>
        <b-list-group-item v-for="answer in currentWinningAnswers" :key="answer.uid">
          "{{ answer.text }}" - {{ f.roomDoc.players.find(p => p.uid === answer.uid).name }} ({{ answer.votes }} oooVotes)
        </b-list-group-item>
      </b-list-group>

      <RoomPlayerStatusPopover :f="f" class="my-2"/>
      <b-badge pill :variant="summaryTimerVariant"><h6 class="m-0">{{ $t('general.secondsLeft', [summaryTimerCount]) }}</h6></b-badge>
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
  voteForAnswer, transitionAfterSummary, getCurrentWinningAnswers, getOrderedPlayersWithTotalPoints
} from '@/lib/firebase_gateway'
import PlayerStatus from '~/components/room/PlayerStatusGrid'

export default {
  components: { PlayerStatus },
  created() {
    setInterval(() => { this.totalPlayTime++ }, 1000);

    if (this.f.roomDoc.gameStatus === 'ANSWER') {
      this.answerTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredAnswerTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.f.roomDoc.gameStatus === 'VOTE') {
      this.voteTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredVoteTimeLimitSec) - getCurrentTimeEpochSec()
    }

    if (this.f.roomDoc.gameStatus === 'SUMMARY') {
      this.summaryTimerCount = (this.f.roomDoc.currentGameStatusTimestampEpochSec + this.f.roomDoc.configuredSummaryTimeLimitSec) - getCurrentTimeEpochSec()
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

    currentWinningAnswers() { return getCurrentWinningAnswers(this.f.roomDoc) },

    answerTimerVariant() { return this.answerTimerCount <= 5 ? 'danger' : this.answerTimerCount <= 15 ? 'warning' : 'light' },
    answerTimerEmoji() { return this.answerTimerCount <= 5 ? '😱' : this.answerTimerCount <= 15 ? '😬' : '🤔' },
    answered() { return this.f.roomDoc.questions[this.f.roomDoc.currentQuestionIndex].answers.some(a => a.uid === this.f.user.uid)},

    voteTimerVariant() { return this.voteTimerCount <= 5 ? 'danger' : this.voteTimerCount <= 15 ? 'warning' : 'light' },
    voteTimerEmoji() { return this.voteTimerCount <= 5 ? '😱' : this.voteTimerCount <= 15 ? '😬' : '🤔' },

    summaryTimerVariant() { return this.answerTimerCount <= 5 ? 'light' : this.answerTimerCount <= 15 ? 'light' : 'light' },
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
    },

    getWinningPlayerWithTotalPoints() {
      let max = 0
      let winningPlayer = null
      this.f.roomDoc.players.forEach(p => {
        const currentPoints = p.points.reduce((total, points) => total + points, 0)
        if (currentPoints > max) { max = currentPoints; winningPlayer = p }
      })
      return winningPlayer
    },
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
          await transitionAfterVote(this.f.roomDocRef, this.f.roomDoc)
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
          await transitionAfterVote(this.f.roomDocRef, this.f.roomDoc)
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
#form-input-answer {
  height: 3rem;
  font-size: 1.5rem;
}

@media (max-width: 768px) { .wait-image { max-height: 6rem } }
@media (min-width: 769px) { .wait-image { max-height: 9rem } }
</style>
