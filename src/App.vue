<template>
  <div id="container">
    <div id="topbar">
      <ylogin></ylogin>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import ylogin from './components/ylogin'
  import axios from 'axios'
  import config from '../config/index'

  export default {
    data: function () {
      return {
        username: 'Mogao'
      }
    },
    components: {
      ylogin
    }
  }

</script>

<style>
  html {
    height: 100%;
  }

  body {
    display: block;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  #container {
    color: #2c3e50;
    margin: auto;
    margin-top: 10px;
    max-width: 1000px;
    font-family: Source Sans Pro, Helvetica, sans-serif;
    text-align: center;
  }

  #container a {
    color: #42b983;
    text-decoration: none;
  }

  .logo {
    width: 100px;
    height: 100px
  }
</style>
