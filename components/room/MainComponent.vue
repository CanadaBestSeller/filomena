<template>



  <!-- IMPORTANT -->
  <!-- For optimization (and also Nuxt's middleware redirect issues), all the screens have to be in the same component -->
  <!-- We will order these screens in a logical if/else-if/else waterfall -->
  <!-- SCREEN 0: ROOM_LOADING. v-if (!room). When firebase has not returned the room status, don't show anything -->
  <!-- SCREEN 1: USER_LOADING. v-if (user === 'loading'). When firebase has not returned the user status, don't show anything -->
  <!-- SCREEN 2: NAME. v-else-if (!user). Not logged in, Firebase has returned a null user. Unless they log in, they won't be included in the game -->
  <!-- SCREEN 3: LOBBY. v-else-if (room.status === 'LOBBY'). At this point in the waterfall the user is logged in. Show the lobby -->
  <!-- SCREEN 4: GAME. v-else-if (room.status === 'GAME'). The host has initiated the game. Show the game -->
  <!-- SCREEN 5: ERROR. v-else. This is a catch-all screen which should never show up.-->



  <!-- SCREEN 0: ROOM_LOADING. v-if (!room). When firebase has not returned the room status, don't show anything -->
  <div v-cloak v-if="!f.roomDoc.status"><b-spinner type="grow" variant="success" /></div>
  <!-- END SCREEN 1: LOADING ============================================================================================-->



  <!-- SCREEN 1: USER_LOADING. v-if (user === 'loading'). When firebase has not returned the user status, don't show anything -->
  <div v-cloak v-else-if="f.user === 'loading'"><b-spinner type="grow" variant="light" /></div>
  <!-- END SCREEN 1: LOADING ============================================================================================-->



  <!-- SCREEN 2: NAME. v-else-if (!user). Not logged in, Firebase has returned a null user. Unless they log in, they won't be included in the game -->
  <div v-cloak v-else-if="!f.user">

    <div class="d-flex justify-content-center m-2"><b-img class="start-image mb-0" src="~/assets/images/panda-pop-up.png"/></div>

    <h2 class="text-center">{{ $t('lobby.welcomeToRoom', [roomId]) }}</h2>

    <b-form @submit.prevent="guestSignInAndEnterRoom" class="text-center">
      <b-form-group id="form-group-name" class="text-center" :label="$t('form.whatsYourName')" label-for="form-input-name">
        <b-form-input id="form-input-name" maxLength="16" v-model="nameForm.name" class="text-center" :placeholder="$t('form.whatsYourNameHint')" required />
        <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!nameForm.errorMessage">{{ nameForm.errorMessage }}</b-form-invalid-feedback>
      </b-form-group>

      <b-container>
        <b-row no-gutters align-h="center">
          <b-col cols="auto"><b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">{{ $t('general.back') }}</b-button></b-col>

          <b-col cols="auto">
            <b-button v-if="nameForm.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
            <b-button v-else class="shadow" size="lg" variant="success" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirmName') }}</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-form>

  </div>
  <!-- END SCREEN 2: NAME========================================================================================-->



  <!-- SCREEN 3: LOBBY. v-else-if (room.status === 'LOBBY'). At this point in the waterfall the user is logged in. Show the lobby -->
  <div v-cloak v-else-if="f.roomDoc.status === 'LOBBY'">
    <RoomLobbyComponent :roomId="roomId" :f="f"/>
  </div>
  <!-- END SCREEN 3: LOBBY =============================================================================================-->



  <!-- SCREEN 4: GAME. v-else-if (room.status === 'GAME'). The host has initiated the game. Show the game, player list, and chat -->
  <div v-cloak v-else-if="f.roomDoc.status === 'GAME'">
    <RoomGameComponent :roomId="roomId" :f="f"/>
  </div>
  <!-- END SCREEN 4: GAME =============================================================================================-->



  <!-- SCREEN 5: ERROR. v-else. This is a catch-all screen which should never show up.-->
  <div v-cloak v-else><b-spinner type="grow" variant="dark" /></div>
  <!-- END SCREEN 5: ERROR =============================================================================================-->
</template>



<script>
import { auth, db } from '@/db/firebase'
import { addPlayer, getOrderedPlayersWithTotalPoints } from '@/lib/firebase_gateway'
export default {

  async created () {
    // Register firebase realtime stream listener on the entire root collection
    this.f.roomDocRef = db.collection('rooms').doc(this.roomId)
    this.f.roomDocRef.onSnapshot({ includeMetadataChanges: false }, doc => {
      if (doc.exists) {
        console.log('Room doc changed:')
        console.log(JSON.stringify(doc.data(), null, '\t'))
        this.f.roomDoc = doc.data()
      } else {
        this.$router.push({ name: 'index', params: { invalidRoomId: this.roomId } })
      }
    })

    // Initialize current user
    this.f.unsubscribe = auth.onAuthStateChanged( firebaseUser => (this.f.user = firebaseUser) )
  },

  data () {
    return {

      f: {
        user: 'loading', /* loading is the default value, since we don't know when firebase will return a user/null object */ unsubscribe: null,
        roomDocRef: null,
        roomDoc: {},  // Empty object makes v-for directives happy instead of null
      },

      nameForm: { name: '', isLoading: false, errorMessage: '' },

    }
  },

  computed: {
    isNameFieldInvalid () { return !this.nameForm.name ? true : this.nameForm.name.length > 40 },
  },

  methods: {
    async guestSignInAndEnterRoom () {
      try {
        this.nameForm.isLoading = true
        this.nameForm.errorMessage = null

        await auth.signInAnonymously()
        this.f.user.displayName = this.nameForm.name  // The below line only updates the db, we have to manually update our in-memory displayName
        await auth.currentUser.updateProfile({ displayName: this.nameForm.name })

      } catch (error) {
        this.nameForm.errorMessage = error.message

      } finally {
        this.nameForm.isLoading = false
      }
    },

    goBack () { this.$router.push('/') },
  },

  watch: {
    // When the user is logged in, add as a player to the room
    'f.user' : async function(newUser, oldUser) {
      if (newUser) { await addPlayer(this.f.roomDocRef, this.f.user.displayName, this.f.user.uid) }
    }
  },

  props: [
    'roomId'
  ]
}
</script>

<style>
#form-input-name { height: 2.5rem; font-size: 1.2rem; }

@media (max-width: 768px) { .start-image { max-height: 6rem } }
@media (min-width: 769px) { .start-image { max-height: 9rem } }
</style>
