<template>


      <!-- If user is loading, don't show anything-->
      <div v-cloak v-if="user === 'loading'">LOADING</div>


      <!-- START IF USER ============================================================================================-->
      <!-- START IF USER ============================================================================================-->
      <div v-cloak v-else-if="user">
        <LobbyRoomLink :roomLink="roomLink"/>
        <b-jumbotron class="text-center m-0 bg-transparent">
          <h2 class="mt-5 mb-2">
            <p>THIS IS ROOM {{ roomId }}</p>
            <p>NAME: {{ user.displayName || localDisplayName }}</p>
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
import { auth } from '@/db/firebase'
export default {

  created () {
    this.unsubscribe = auth.onAuthStateChanged( firebaseUser => (this.user = firebaseUser) )
  },

  data () {
    return {
      auth,
      form: { name: '', isLoading: false, errorMessage: '' },
      user: 'loading', // loading is the default value, since we don't know when firebase will return a user/null object
      unsubscribe: null,
      localDisplayName: ''
    }
  },

  computed: {
    isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 },
    roomId () { return this.$route.params.room },
    roomLink () { return 'thumbs.up.railway.app/' + this.$route.params.room },
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

    goBack () { this.$router.push('/') }
  }
}
</script>

