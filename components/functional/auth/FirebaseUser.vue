<template>
  <div>
    <slot name="user" :user="user" />
  </div>
</template>

<script>
import { auth } from '@/db/firebase'

export default {
  data () {
    return {
      user: null,
      unsubscribe: null
    }
  },

  created () {
    this.unsubscribe = auth.onAuthStateChanged(
      firebaseUser => (this.user = firebaseUser)
    )
  },

  destroyed () {
    this.unsubscribe()
  },

  methods: {
    destroy () {
      this.$destroy()
    }
  }
}
</script>
