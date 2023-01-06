<template>
  <div class="text-center bg-transparent">
    <h3>{{ $t('form.enterTheCode') }}</h3>
    <div class="mx-5">
      <b-form @submit.prevent="guestSignInAndJoinRoom">
        <b-form-group id="form-group-code mx-5">
          <b-form-input id="form-input-code" class="text-center" maxlength="4" v-model="form.code" :placeholder="$t('form.enterTheCodeHint')" required oninput="let p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p, p);"/>
          <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
        </b-form-group>

        <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">
          {{ $t('general.back') }}
        </b-button>

        <b-button v-if="form.isLoading" class="shadow" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
        <b-button v-else class="shadow" size="lg" variant="primary" type="submit" :disabled="isCodeFieldInvalid">{{ $t('general.confirm') }}</b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {

  data () { return { form: { code: '', isLoading: false, errorMessage: '' } } },

  computed: { isCodeFieldInvalid () { return this.form.code.length !== 4 }, },

  methods: {
    async guestSignInAndJoinRoom () {
      try {
        this.form.isLoading = true
        this.form.errorMessage = null
        await this.$router.push('/' + this.form.code)

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

<style>
#form-input-code {
  height: 3.5rem;
  font-size: 2rem;
}
</style>
