<template>
  <!--  Center the component-->
  <div class="text-center bg-transparent">

    <h2 class="mb-5">
      {{ $t('start.letsStartTheParty') }}
    </h2>

    <div class="mx-5">
      <b-form @submit="onSubmit">
        <b-form-group id="form-group-name lg" :label="$t('form.whatsYourName')" label-for="form-input-name">
          <b-form-input id="form-input-name" v-model="form.name" :placeholder="$t('form.whatsYourNameHint')" required/>
        </b-form-group>

        <b-button class="shadow" size="lg" variant="outline-danger" @click="goBack()">{{ $t('general.back') }}</b-button>
        <b-button class="shadow" size="lg" variant="primary" type="submit" :disabled="isNameFieldInvalid">{{ $t('general.confirm') }}</b-button>
      </b-form>
    </div>

  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        name: ''
      }
    }
  },
  computed: {
    isNameFieldInvalid () { return !this.form.name ? true : this.form.name.length > 40 }
  },
  methods: {
    onSubmit (event) {
      event.preventDefault()
      alert(JSON.stringify(this.form))
    },
    goBack () {
      this.$router.push({ path: this.localePath({ path: '/' }) })
    }
  }
}
</script>
