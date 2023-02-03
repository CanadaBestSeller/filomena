<template>
  <b-navbar id="navbar" fixed="bottom" class="justify-content-between">
    <b-navbar-nav>
      <li id="i18n" class="nav-item" size="lg">
        <FooterI18nSelector />
      </li>
    </b-navbar-nav>

    <b-navbar-nav>
      <li class="nav-item">
        <i18n id="credits" path="landing.madeBy" tag="p">
          <a href="https://github.com/CanadaBestSeller">CanadaBestSeller</a>
        </i18n>
      </li>
    </b-navbar-nav>

    <b-navbar-nav>
      <li id="dark-mode" class="nav-item align-self-center">
        <b-link class="text-decoration-none" @click="toggleDarkMode()">
          {{ $colorMode.value === 'dark' ? '🌞' : '🌚' }}
        </b-link>
      </li>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
export default {
  methods: {
    toggleDarkMode () {
      if (this.$colorMode.preference === 'dark') {
        this.$colorMode.preference = 'light'
      } else {
        this.$colorMode.preference = 'dark'
      }
    }
  }
}
</script>

<style>
#credits {
  font-size: 0.8rem;
  margin: 0;
}

#i18n {
  font-size: 1.5rem;
}

#dark-mode {
  font-size: 1.5rem;
}
</style>
