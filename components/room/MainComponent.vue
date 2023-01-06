<template>



  <!-- IMPORTANT -->
  <!-- For optimization (and also Nuxt's middleware redirect issues), all the screens have to be in the same component -->
  <!-- We will order these screens in a logical if/else-if/else waterfall -->
  <!-- SCREEN 0: ROOM_LOADING. v-if (!room). When firebase has not returned the room doc -->
  <!-- SCREEN 1: USER_LOADING. v-if (user === 'loading'). When firebase has not returned the user status, don't show anything -->
  <!-- SCREEN 2: NAME. v-else-if (!user). Not logged in, Firebase has returned a null user. Unless they log in, they won't be included in the game -->
  <!-- SCREEN 3: LOBBY. v-else-if (room.status === 'LOBBY'). At this point in the waterfall the user is logged in. Show the player list and chat -->
  <!-- SCREEN 4: GAME. v-else-if (room.status === 'GAME'). The host has initiated the game. Show the game, playerlist, and chat -->
  <!-- SCREEN 5: ERROR. v-else. This is a catch-all screen which should never show up.-->



  <!-- SCREEN 0: ROOM_LOADING. v-if (!room). When firebase has not returned the user status, don't show anything -->
  <div v-cloak v-if="!firebase.roomDoc.status"><b-spinner type="grow" variant="success" /></div>
  <!-- END SCREEN 1: LOADING ============================================================================================-->



  <!-- SCREEN 1: USER_LOADING. v-if (user === 'loading'). When firebase has not returned the user status, don't show anything -->
  <div v-cloak v-else-if="firebase.user === 'loading'"><b-spinner type="grow" variant="light" /></div>
  <!-- END SCREEN 1: LOADING ============================================================================================-->



  <!-- SCREEN 2: NAME. v-else-if (!user). Not logged in, Firebase has returned a null user. Unless they log in, they won't be included in the game -->
  <div v-cloak v-else-if="!firebase.user">

    <RoomLinkComponent :roomId="roomId"/>

    <div class="text-center bg-transparent">
      <div class="mx-5">
        <b-form @submit.prevent="guestSignInAndEnterRoom">
          <b-form-group id="form-group-name lg" :label="$t('form.whatsYourName')" label-for="form-input-name">
            <b-form-input id="form-input-name" v-model="nameForm.name" :placeholder="$t('form.whatsYourNameHint')" required />
            <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!nameForm.errorMessage">{{ nameForm.errorMessage }}</b-form-invalid-feedback>
          </b-form-group>

          <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">
            {{ $t('general.back') }}
          </b-button>

          <b-button v-if="nameForm.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
          <b-button v-else class="shadow" size="lg" variant="success" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirmName') }}</b-button>
        </b-form>
      </div>
    </div>
  </div>
  <!-- END SCREEN 2: NAME========================================================================================-->



  <!-- SCREEN 3: LOBBY. v-else-if (room.status === 'LOBBY'). At this point in the waterfall the user is logged in. Show the player list and chat -->
  <div v-cloak v-else-if="firebase.roomDoc.status === 'LOBBY'">
    <RoomLobbyComponent :roomId="roomId" :firebase="firebase"/>
  </div>
  <!-- END SCREEN 3: LOBBY =============================================================================================-->



  <!-- SCREEN 4: GAME. v-else-if (room.status === 'GAME'). The host has initiated the game. Show the game, playerlist, and chat -->
  <div v-cloak v-else-if="firebase.roomDoc.status === 'GAME'">
    <RoomGameComponent :roomId="roomId" :firebase="firebase"/>
  </div>
  <!-- END SCREEN 4: GAME =============================================================================================-->



  <!-- SCREEN 5: ERROR. v-else. This is a catch-all screen which should never show up.-->
  <div v-cloak v-else><b-spinner type="grow" variant="dark" /></div>
  <!-- END SCREEN 5: ERROR =============================================================================================-->
</template>



<script>
import { auth, db } from '@/db/firebase'
import { addPlayer } from '@/lib/firebase_utils'
export default {

  async created () {
    // Register firebase realtime stream listener on the entire root collection
    this.firebase.roomDocRef = db.collection('rooms').doc(this.roomId)
    this.firebase.roomDocRef.onSnapshot({ includeMetadataChanges: true }, doc => {
      if (doc.exists) {
        console.log('Room doc changed:')
        console.log(doc.data())
        this.firebase.roomDoc = doc.data()
      } else {
        this.$router.push({ name: 'index', params: { invalidRoomId: this.roomId } })
      }
    })

    // Initialize current user
    this.firebase.unsubscribe = auth.onAuthStateChanged( firebaseUser => (this.firebase.user = firebaseUser) )
  },

  data () {
    return {

      firebase: {
        user: 'loading', /* loading is the default value, since we don't know when firebase will return a user/null object */ unsubscribe: null,
        roomDocRef: null,
        roomDoc: {},  // Empty object makes v-for directives happy instead of null
      },

      nameForm: { name: '', isLoading: false, errorMessage: '' },

    }
  },

  computed: {
    roomId () { return this.$route.params.room.toUpperCase() },
    isNameFieldInvalid () { return !this.nameForm.name ? true : this.nameForm.name.length > 40 },
  },

  methods: {
    async guestSignInAndEnterRoom () {
      console.log('guestSignInAndEnterRoom')
      try {
        this.nameForm.isLoading = true
        this.nameForm.errorMessage = null

        await auth.signInAnonymously()
        this.firebase.user.displayName = this.nameForm.name  // The below line only updates the db, we have to manually update our in-memory displayName
        await auth.currentUser.updateProfile({ displayName: this.nameForm.name })

      } catch (error) {
        this.nameForm.errorMessage = error.message

      } finally {
        this.nameForm.isLoading = false
      }
    },

    goBack () { this.$router.push('/') },
    head () { return { title: this.roomId } },
  },

  watch: {
    // When the user is logged in, add as a player to the room
    'firebase.user' : async function(newUser, oldUser) {
      if (newUser) { await addPlayer(this.firebase.roomDocRef, this.firebase.user.displayName, this.firebase.user.uid) }
    }
  }
}
</script>

<style>
#form-input-name { height: 2.5rem; font-size: 1.2rem; }
</style>
