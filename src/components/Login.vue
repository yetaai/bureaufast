<template>
  <div class="logkjlkin">
    {{ username }}, Welcome to login test now!
  </div>

</template>

<script>
  //    var formdata = new FormData();
  //    formdata.append("usertimekey", this.$cookie.get('usertimekey'))
  export default {
    data () {
      return {
// note: changing this line won't causes changes
// with hot-reload because the reloaded component
// preserves its current state and we are modifying
// its initial state.
        username: 'Oefish'
      }
    }

//    ready: function() {
//            // construct form data
//            this.$http.post('/login', formdata, function(data) {
//                this.$cookie.set('usertimekey', data.)
//            })
//        }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1 {
    color: #42b983;
  }
</style>
