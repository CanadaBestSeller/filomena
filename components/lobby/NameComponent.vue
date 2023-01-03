<template>
  <!--  Center the component-->
  <div class="text-center bg-transparent">

    <h3 class="mb-4">
      {{ $t('start.letsStartTheParty') }}
    </h3>

    <div class="mx-5">
      <b-form @submit.prevent="guestSignIn">
        <b-form-group id="form-group-name lg" :label="$t('form.whatsYourName')" label-for="form-input-name">
          <b-form-input id="form-input-name" v-model="form.name" :placeholder="$t('form.whatsYourNameHint')" required />
          <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
        </b-form-group>

        <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">
          {{ $t('general.back') }}
        </b-button>

        <b-button v-if="form.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
        <b-button v-else class="shadow" size="lg" variant="primary" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirm') }}</b-button>

      </b-form>
    </div>

  </div>
</template>

<script>
import { auth } from '@/db/firebase'

export default {
  data () {
    return {
      auth,
      form: {
        name: '',
        isLoading: false,
        errorMessage: ''
      }
    }
  },
  computed: {
    isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 }
  },
  methods: {

    async guestSignIn () {
      try {
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

    goBack () {
      this.$router.push({ path: this.localePath({ path: '/' }) })
    }
  }
}
</script>
