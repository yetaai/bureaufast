<template xmlns:v-bind="http://www.w3.org/1999/xhtml" xmlns:v-on="http://www.w3.org/1999/xhtml">
  <!--<template id="dialog-template">-->
  <div class = "dialogs">
    <div class = "dialog" v-bind:class="{ 'dialog-active': show }">
      <div class="dialog-content">
        <header class="dialog-header">
          <h1 class="dialog-title">Input help</h1>
        </header>
        <table>
          <tr>
            <td colspan="2">{{reqcol.txt}}</td>
          </tr>
          <tr>
            <td><label>{{txtsearch}}</label></td>
            <td><label>{{txtmaxitems}}</label></td>
          </tr>
          <tr>
            <td>
              <input type="text" class="search-input" placeholder="filter by" v-model="searchquery" v-on:keyup.enter="filter(searchquery)">
            </td>
            <td>
              <input type="text" class="maxitems" placeholder="max items" v-model="maxitems">
            </td>
          </tr>
        </table>
        <table id="titems">
          <thead>
            <tr>
              <th>Select</th>
              <th v-for="col in optcols" class="form-group">{{optcolstxt[col.orgTable + "-" + col.orgName]}}</th>
            </tr>
          </thead>
          <tbody v-if="items && items.length > 0">
            <tr v-for="item in items" class="form-group">
              <button v-on:click="choose(item)">Choose</button>
              <td v-for="col in optcols">{{item[col.orgName]}} </td>
            </tr>
          </tbody>
        </table>
        <p><button v-on:click="close()">Cancel</button></p>
      </div>
    </div>
  </div>
</template>
<style>
  #titems{
    margin: 0 auto;
    border-collapse: collapse;
  }
  #titems, #titems th, #titems td{
    border: solid 1px black;
  }
  .dialog {
    max-width: 480px;
    position: fixed;
    left: 50%;
    top: 2em;
    transform: translateX(-50%);
    z-index: 2000;
    visibility: hidden;
    backface-visibility: hidden;
    perspective: 1300px;
  }

  .dialog-active {
    visibility: visible;
  }

  .dialog-active .dialog-content {
    opacity: 1;
    transform: rotateY(0);
  }

  .dialog-active ~ .dialog-overlay {
    opacity: 1;
    visibility: visible;
  }

  .dialog-content {
    border-radius: 3px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: .5s ease-in-out;
    opacity: 0;
    transform-style: preserve-3d;
    transform: rotateY(-70deg);
  }

  .dialog-header {
    background: #42b983;
    color: #fff;
  }

  .dialog-title {
    margin: 0;
    font-size: 2em;
    text-align: center;
    font-weight: 200;
    line-height: 2em;
  }

  .dialog-body {
    padding: 2em;
  }

  .dialog-footer {
    margin: 0 2em;
    padding: 2em 0;
    text-align: right;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .dialog-overlay {
    content: "";
    position: fixed;
    visibility: hidden;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    opacity: 0;
    background: rgba(0, 0, 0, 0.5);
    transition: all .6s;
  }
</style>
<script>
  import axios from 'axios'
  import safe from '../assets/secret'

  export default {
    props: ['showdial', 'reqcol', 'uinfo', 'datacols', 'reqcolopt'],
    data: function() {
      return {
        show: false,
        optcols: [],
        items: [],
        optcolstxt: {},
        searchquery: '',
        txtsearch: '', //'Search',
        txtmaxitems: '', //'Max items',
        maxitems: this.uinfo.pagesize * 2
      }
    },
    methods: {
      itemclicked: function(pitem) {
        var low = 0
        var high = 1
        if (this.reqcolopt === low) {
          this.reqcol.lowval = pitem[this.reqcol.fldname]
        } else if (this.reqcolopt === high) {
          this.reqcol.highval = pitem[this.reqcol.fldname]
        }
        this.close()
      },
      choose: function(pitem) {
        this.itemclicked(pitem)
      },
      filter: function(pKey) {
        if (pKey.length === 0) {
          for (var i0 in this.items) {
            this.items[i0].filtered = 1
          }
        } else {
          for (var i in this.items) {
            var selected = false
            for (var j in this.optcols) {
              if (this.items[i][this.optcols[j]].indexOf(pKey) >= 0) {
                selected = true
              }
            }
            if (!selected) {
              this.items[i].filered = 1
            }
          }
        }
      },
      close: function() {
        this.show = false
        this.$parent.closehelp()
        this.reqcol = {'fldname': ''}
      }
    },
    events: {
      'ashowDialog': function(pShow) {
        console.log('showDialog Event triggered so in event processing')
        this.show = pShow
      },
      'aonShowDialog': function(pShow) {
        console.log('onShowDialog Event triggered so in event processing')
        this.show = pShow
      }
    },
    created: function() {
      var vm = this
      var formjson = {}
      formjson['reqcol'] = this.reqcol
      formjson['maxitems'] = this.uinfo.pagesize * 2
      formjson['uinfo'] = this.uinfo
      axios.post('/inputhelp', formjson).then(function(res) {
        if (res.status === 210) {
          window.alert('Input help for ' + vm.reqcol.tblname + '/' + vm.reqcol.fldname + ' is not configured.')
          vm.close()
          return
        } else if (res.status > 399) {
          window.alert('Input help for ' + vm.reqcol.tblname + '/' + vm.reqcol.fldname + ' return: ' + res.status + ' / ' + JSON.stringify(res.data))
          vm.close()
          return
        }
        vm.show = vm.showdial
        console.log('input help is being shown. response from /inputhlep: ' + JSON.stringify(res.data))

        vm.optcols = res.data.optcols
        var tt = res.data.optcolstxt
        var tt1 = {}
        for (var i in tt) {
          tt1[tt[i].tblname + '-' + tt[i].fldname] = tt[i].txt
        }
        vm.optcolstxt = tt1

        vm.items = res.data.items
        for (var k in vm.items) {
          vm.items[k].filtered = 0
        }

        vm.txtsearch = res.data[safe.txtfilter.toString()]
        vm.txtmaxitems = res.data[safe.txtmaxitems.toString()]
      }).catch(function(e) {
        console.log('error by /inputhelp post request for ' + vm.reqcol.tblname + '/' + vm.reqcol.fldname + '. \n ' + e)
      })
    }
  }
</script>
