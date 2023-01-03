<template>
  <div class="dropup" @mouseover="showDropup()">
    <b-link class="text-decoration-none">
      🌎
    </b-link>
    <div class="dropup-content" @click="hideDropup()" @mouseleave="hideDropup()">
      <b-link @click="switchLocale('en')">🇺🇸 <span class="locale-text">English</span></b-link>
      <b-link @click="switchLocale('fr')">🇫🇷 <span class="locale-text">Français</span></b-link>
      <b-link @click="switchLocale('zh')">🇨🇳 <span class="locale-text">中文</span></b-link>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    showDropup () {
      this.$el.querySelector('.dropup-content').style.display = 'block'
    },
    hideDropup () {
      this.$el.querySelector('.dropup-content').style.display = 'none'
    },
    switchLocale (locale) {
      this.$i18n.setLocale(locale)
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
  min-width: 7rem;
  z-index: 1;
}

/* Links inside the dropup */
.dropup-content a {
  display: block;
}
</style>
