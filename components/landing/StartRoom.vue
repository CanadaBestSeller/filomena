<template>

  <!-- If user is loading, don't show anything-->
  <div v-cloak v-if="user === 'loading'"><b-spinner type="grow" variant="danger" /></div>


  <!-- START IF NOT USER ========================================================================================-->
  <!-- START IF NOT USER ========================================================================================-->
  <div v-else-if="!user">

    <h2>{{ $t('lobby.letsStartTheParty') }}</h2>

    <b-form @submit.prevent="guestSignInAndCreateRoom">
      <b-form-group class="my-3 text-center" id="form-group-name" :label="$t('form.whatsYourName')" label-for="form-input-name">
        <b-form-input id="form-input-name" maxLength="16" v-model="form.name" class="text-center" :placeholder="$t('form.whatsYourNameHint')" required />
        <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
      </b-form-group>

      <b-container>
        <b-row no-gutters align-h="center">
          <b-col cols="auto"><b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">{{ $t('general.back') }}</b-button></b-col>

          <b-col cols="auto">
            <b-button v-if="form.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
            <b-button v-else class="shadow" size="lg" variant="success" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirmName') }}</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-form>

  </div>
  <!-- END IF NOT USER =========================================================================================-->
  <!-- END IF NOT USER =========================================================================================-->


  <!-- START IF USER ============================================================================================-->
  <!-- START IF USER ============================================================================================-->
  <div v-else><b-spinner type="grow" variant="warning" /></div>
  <!-- END IF USER =============================================================================================-->
  <!-- END IF USER =============================================================================================-->


</template>

<script>
import { auth } from '~/db/firebase.js'
import { createRoomReturnId } from '~/lib/firebase_gateway'
export default {

  data () {
    return {
      user: 'loading', firebaseUnsubscribe: null,
      form: { name: '', isLoading: false, errorMessage: '' },
    }
  },

  created() { this.fUnsubscribe = auth.onAuthStateChanged( firebaseUser => (this.user = firebaseUser) ) },

  computed: { isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 }, },

  methods: {
    async guestSignInAndCreateRoom () {
      try {
        this.form.isLoading = true
        this.form.errorMessage = null

        await auth.signInAnonymously()

        // Need to wait for this critical step, otherwise the player will not have a displayName in the next screen
        await auth.currentUser.updateProfile({ displayName: this.form.name })

        const roomId = await createRoomReturnId(this.user.uid)
        await this.$router.push('/' + roomId)

      } catch (error) {
        this.form.errorMessage = error.message

      } finally {
        this.form.isLoading = false
      }
    },

    goBack () { this.$router.push('/') }
  },

  watch: {
    /**
     * This is a hack! We need a way to detect that upon visiting this page, the user is already logged in.
     * The way we do this is by setting the user's null state to 'loading', and after that firebase takes its time to
     * update user to either User or null. We only want to push immediately after a transition from 'loading'->User
     * If there's a transition from null->User, that means the player just logged in, in which case we don't push
     * immediately, and need to first update the displayName
     * @param newUser
     * @param oldUser
     * @returns {Promise<void>}
     */
    user: async function(newUser, oldUser) {
      if (newUser && newUser !== 'loading' && oldUser === 'loading') {
        const roomId = await createRoomReturnId(this.user.uid)
        await this.$router.push('/' + roomId)
      }
    }
  }
}
</script>

<style>
#form-input-name {
  height: 2.5rem;
  font-size: 1.2rem;
}

.btn {
  margin: .2rem;
}
</style>
