<template>


      <!-- If user is loading, don't show anything-->
      <div v-cloak v-if="user === 'loading'">LOADING</div>


      <!-- START IF USER ============================================================================================-->
      <!-- START IF USER ============================================================================================-->
      <div v-cloak v-else-if="user">
        <LobbyRoomLink :roomLink="roomLink"/>

        <b-card class="mb-3">
          <b-container v-for="message in messagesUi" :key="message.id">
            <b-row>
              <b-col cols="auto" >
                <b-card bg-variant="secondary" :header="message.sender">
                  {{ message.text }}
                </b-card>
              </b-col>
            </b-row>
          </b-container>
        </b-card>

          <b-input-group>
            <b-form-input v-model="newMessageText" />
            <b-input-group-append>
              <b-button variant="primary" :disabled="!newMessageText || isLoading" type="text" @click="addMessage">Send ✈️</b-button>
            </b-input-group-append>
          </b-input-group>


        <b-jumbotron class="text-center m-0 bg-transparent">
          <h2 class="mt-5 mb-2">
            <p>NAME: {{ username }}</p>
          </h2>
        </b-jumbotron>
      </div>
      <!-- END IF USER =============================================================================================-->
      <!-- END IF USER =============================================================================================-->


      <!-- START IF NOT USER ========================================================================================-->
      <!-- START IF NOT USER ========================================================================================-->
      <div v-cloak v-else>

        <LobbyRoomLink :roomLink="roomLink"/>

        <div class="text-center bg-transparent">
          <div class="mx-5">
            <b-form @submit.prevent="guestSignInAndEnterRoom">
              <b-form-group id="form-group-name lg" :label="$t('form.whatsYourName')" label-for="form-input-name">
                <b-form-input id="form-input-name" v-model="form.name" :placeholder="$t('form.whatsYourNameHint')" required />
                <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
              </b-form-group>

              <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">
                {{ $t('general.back') }}
              </b-button>

              <b-button v-if="form.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
              <b-button v-else class="shadow" size="lg" variant="success" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirmName') }}</b-button>
            </b-form>
          </div>
        </div>
      </div>
      <!-- END IF NOT USER =========================================================================================-->
      <!-- END IF NOT USER =========================================================================================-->


</template>

<script>
import { auth, db } from '@/db/firebase'
export default {

  async created () {
    this.unsubscribe = auth.onAuthStateChanged( firebaseUser => (this.user = firebaseUser) )
    // Get the actual firebase doc ID of the room
    const firebaseRoomQuerySnapshot = await db.collection('room').where('roomId', '==', this.roomId).limit(1).get()
    console.log(firebaseRoomQuerySnapshot.docs[0].data())
    this.firebaseRoomDocId = firebaseRoomQuerySnapshot.docs[0].id
  },

  data () {
    return {
      auth,
      form: { name: '', isLoading: false, errorMessage: '' },
      user: 'loading', // loading is the default value, since we don't know when firebase will return a user/null object
      unsubscribe: null,

      localDisplayName: '',

      isLoading: false,
      newMessageText: '',
      messagesUi: [],

      firebaseRoomDocId: 'undefined_firebaseRoomDocId'
    }
  },

  computed: {
    username() { return this.user.displayName || localDisplayName },
    isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 },
    roomId () { return this.$route.params.room.toUpperCase() },
    roomLink () { return 'thumbs.up.railway.app/' + this.roomId },
    messageDb() { return db.doc('room/YKf3AyCmcoThz8QTEwfn').collection("chatMessage") },
    // messageDb() { return db.doc(`room/${this.firebaseRoomDocId}`).collection("chatMessage") },
  },

  firestore() {
    return {
      messagesUi: this.messageDb.orderBy('createdAt').limitToLast(25)
    }
  },

  methods: {
    async guestSignInAndEnterRoom () {
      try {
        this.localDisplayName = 'local:'+this.form.name

        this.form.isLoading = true
        this.form.errorMessage = null

        await auth.signInAnonymously()
        await auth.currentUser.updateProfile({ displayName: this.form.name })

      } catch (error) {
        this.form.errorMessage = error.message

      } finally {
        this.form.isLoading = false
      }
    },

    goBack () { this.$router.push('/') },

    async addMessage() {
      this.isLoading = true
      const { id: messageId } = this.messageDb.doc()
      await this.messageDb.doc(messageId).set({ text: this.newMessageText, sender: this.user.uid, name: this.username, createdAt: Date.now() })
      this.isLoading = false
      this.newMessageText = ""
    }
  },

  head () {
    return {
      title: this.roomId
    }
  },
}
</script>

<style>
.btn {
  margin: .2rem;
}
</style>
