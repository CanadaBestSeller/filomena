<template>

  <div>

    <div class="d-flex justify-content-center m-2">
      <b-img class="enter-image" src="~/assets/images/panda-laptop.png"/>
    </div>

    <h3 class="text-center">{{ $t('form.enterTheCode') }}</h3>

    <b-form @submit.prevent="guestSignInAndJoinRoom">

      <b-form-group id="form-group-code">
        <b-form-input id="form-input-code" class="text-center" maxLength="4" v-model="form.code" :placeholder="$t('form.enterTheCodeHint')" required oninput="let p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p, p);"/>
        <b-form-invalid-feedback id="submit-feedback" v-bind:force-show="!!form.errorMessage">{{ form.errorMessage }}</b-form-invalid-feedback>
      </b-form-group>

      <b-container>
        <b-row align-h="center" no-gutters>
          <b-col cols="auto"><b-button class="shadow mx-1" size="lg" variant="outline-danger" @click="goBack()">{{ $t('general.back') }}</b-button></b-col>
          <b-col cols="auto">
            <b-button v-if="form.isLoading" class="shadow mx-1" size="lg" variant="primary" type="submit" disabled><b-spinner small /></b-button>
            <b-button v-else class="shadow mx-1" size="lg" variant="primary" type="submit" :disabled="isCodeFieldInvalid">{{ $t('general.confirm') }}</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
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

@media (max-width: 399px) { .enter-image { max-height: 6rem } }
@media (min-width: 400px) { .enter-image { max-height: 9rem } }
</style>
