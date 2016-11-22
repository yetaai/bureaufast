<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
    <div><input v-if="viflogin==0" v-model="vuser" placeholder="Your name" v-on:keyup.enter="vlogin()">
      <input type="password" v-if="viflogin==0" v-model="vpass" placeholder="Password" v-on:keyup.enter="vlogin()">
      <p v-if="vwrongpass==1">Either wrong user name or password.</p>
      <span v-if="viflogin==1">{{vuser}}, Welcome!</span>
      <button v-if="viflogin==1" v-on:click="vlogout()">logout</button>
    </div>
    <vbiz v-if="viflogin==1" v-bind:vbiz-uinfo="uinfo"></vbiz>
    <!--<vside v-if="viflogin==1" v-bind:vside-uinfo="uinfo"></vside>-->
  </div>
</template>
<style>
  body {
    background-color: #ffffff;
  }
</style>
<script>
  import Vue from 'vue'
  import axios from 'axios'
  import config from '../../config/index'
  import ycookie from 'vue-cookie'
  import yutil from '../utils/yutils'
  import sha256 from 'sha256'
  import safe from '../assets/secret'
  import vbiz from './vbiz.vue'

  export default {
    data: function () {
      return {
        viflogin: -1,
        vwrongpass: 0,
        vuser: '',
        vpass: '',
        uinfo: {}
      }
    },
    components: {
      vbiz
    },
    methods: {
      checklogin: function () {
        var vm1 = this
        var formjson = {}
        formjson[safe.u] = ycookie.get(safe.u)
        formjson[safe.user] = ycookie.get(safe.user)
        formjson[safe.token] = ycookie.get(safe.token)
        formjson[safe.agent] = ycookie.get(safe.agent)
        formjson[safe.timekey] = ycookie.get(safe.timekey)
        if (yutil.isset(formjson[safe.user]) && yutil.isset(formjson[safe.token]) && yutil.isset(formjson[safe.timekey])) {
          axios.post('/userLogin', formjson,
            {headers: {'Content-Type': 'application/json'}}).then(function (response) {
            console.log('response.status: ' + response.status)
            if (response.status == 200) {
              console.log('')
              vm1.uinfo = response.data
              vm1.vuser = yutil.yDecode(formjson[safe.user])
              vm1.viflogin = 1
              vm1.vwrongpass = 0
            } else if (response.status == 210) {
              console.log('rejected in checklogin by status 210?')
              vm1.viflogin = 0
              vm1.vpass = ''
            } else {
              vm1.viflgoin = 0
              vm1.vpass = ''
            }
          }).catch(function (err) {
            console.log('rejected in checklogin.' + err)
            vm1.vpass = ''
            vm1.viflogin == 0
            vm1.vwrongpass == 0
          })
        } else {
          if (yutil.isset(formjson[safe.user])) {
            vm1.vuser = formjson[safe.user]
          }
          vm1.viflogin = 0
          vm1.vwrongpass = 0
        }
      },
      vlogin: function() {
        var vm1 = this
        var formjson = {}
        formjson[safe.timekey] = yutil.getTimekey()
        formjson[safe.user] = yutil.yEncode(this.vuser)
        formjson[safe.token] = sha256(sha256(this.vpass) + formjson[safe.timekey])
        formjson[safe.agent] = yutil.yEncode(navigator.appName + navigator.appVersion)
        axios.post('/userLogin', formjson, {headers: {'Content-Type': 'application/json'}}).then(function (response) {
          if (response.status == 200) {
            ycookie.set(safe.u, response.data[safe.u], 1)
            ycookie.set(safe.user, formjson[safe.user], 1)
            ycookie.set(safe.token, formjson[safe.token], 1)
            ycookie.set(safe.agent, formjson[safe.agent], 1)
            ycookie.set(safe.timekey, formjson[safe.timekey], 1)
            vm1.uinfo = response.data
            vm1.viflogin = 1
            vm1.vwrongpass = 0
          } else {
            console.log('in else response.status: ' + response.status)
            vm1.viflogin = 0
            vm1.vwrongpass = 1
            vm1.vpass = ''
          }
        }).catch(function (err) {
          console.log('rejected in vlogin. err ' + err)
          vm1.viflogin = 0
          vm1.vwrongpass = 1
          vm1.vpass = ''
        })
      },
      vlogout: function() {
        ycookie.set(safe.token, '', -1)
        ycookie.set(safe.agent, '', -1)
        ycookie.set(safe.timekey, '', -1)
        ycookie.set(safe.user, '', -1)
        ycookie.set(safe.u, '', -1)
        this.viflogin = 0
        this.vuser = ''
        this.vpass = ''
      }
    },
    created: function() {
      this.checklogin()
    }
  }
</script>
