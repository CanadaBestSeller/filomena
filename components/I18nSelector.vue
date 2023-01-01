<template>
  <div class="dropup">
    <b-link class="text-decoration-none">
      🌎
    </b-link>
    <div class="dropup-content">
      <nuxt-link :to="switchLocalePath('en')">🇺🇸 <span class="locale-text">English</span></nuxt-link>
      <nuxt-link :to="switchLocalePath('fr')">🇫🇷 <span class="locale-text">Français</span></nuxt-link>
      <nuxt-link :to="switchLocalePath('zh')">🇨🇳 <span class="locale-text">中文</span></nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isDropped: false
    }
  },

  methods: {
    toggleDropup () {
      this.isDropped = !this.isDropped
    }
  }
}
</script>

<style>
/* Make locale text smaller */
.locale-text {
  position: relative;
  font-size: 1rem;
  bottom: .2rem;
}

.dropup {
  position: relative;
}

/* Dropup content (Hidden by Default) */
.dropup-content {
  display: none;
  position: absolute;
  bottom: 2.2rem;
  min-width: 10rem;
  z-index: 1;
}

/* Links inside the dropup */
.dropup-content a {
  text-decoration: none;
  display: block;
  opacity: .5;
}

/* Change color of dropup links on hover */
.dropup-content a:hover {
  text-decoration: none;
  opacity: 1;
}

/* Show the dropup menu on hover */
.dropup:hover .dropup-content {
  display: block;
}
</style>
