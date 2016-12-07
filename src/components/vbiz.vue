<template xmlns:v-bind="http://www.w3.org/1999/xhtml" xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
    <p>
      <label>Language: </label>
      <select v-model="locale" v-on:change="updateU()">
        <option v-for="alocale in locales" v-bind:value="alocale">{{alocale}}</option>
      </select>
      <label>Dateformat: </label>
      <select v-model="dateformat" v-on:change="updateU()">
        <option v-for="adateformat in dateformats" v-bind:value="adateformat">{{adateformat}}</option>
      </select>
      <label>Page rows: </label><input v-model="pagesize" v-on:change="updateU()">
    </p>
    <select v-model="selectedot" v-on:change="updateU()">
      <option v-for="otype in ots" v-bind:value="otype.ot">{{otype.name}}</option>
    </select>
    <select v-model="listtype" v-on:change="updateU()">
      <option v-for="lt in lts" v-bind:value="lt.lt">{{lt.name}}</option>
    </select>
    <table v-if="selectedot > -1">
      <tr v-for="otf in otfs">
        <td>{{otf.txt}}</td>
        <!--<td><input v-model="otf.lowval" v-on:keyup.F4="inputhelp(otf.tblname, otf.fldname)"></td>-->
        <!--<td><input v-model="otf.highval" v-on:keyup.F4="inputhelp(otf.tblname, otf.fldname)"></td>-->
        <td><select v-model="otf.lowoption">
          <option v-for="comparatorl in comparatorsl" v-bind:value="comparatorl.value">{{comparatorl.name}}</option>
        </select></td>
        <td><input v-model="otf.lowval">
          <button v-on:click="inputhelp(otf, 0)"></button>
        </td>
        <td><select v-model="otf.highoption" @change="clearhigh(otf)">
          <option v-for="comparatorh in comparatorsh" v-bind:value="comparatorh.value">{{comparatorh.name}}</option>
        </select></td>
        <td><input v-model="otf.highval">
          <!--<button v-if="otf.highoption!='nn'" @click="inputhelp(otf, 1)"></button>-->
          <button @click="inputhelp(otf, 1)"></button>
        </td>
      </tr>
    </table>
    <valdial v-if="showdial" :showdial="showdial" :datacols="otfs" :reqcol="reqcol" :uinfo="vbizUinfo"
             :reqcolopt="reqcolopt"></valdial>
    <button v-if="otfs.length>0" @click="getobjs(selectedot)">Query -- this will refresh from server sorted and page
      no
    </button>
    <p v-if="objs.length===0">No objects selected.</p>
    <div v-if="objs.length>0">
      <p>Double click to reset sort. Single click to watch how sort fields change.</p>
      <p>
        <button @click="sortlocal()">Sort Local -- this page only</button>
      </p>
      <table id="tobjs">
        <tr>
          <th v-for="superfld in superflds">
            <label>{{superfld.txt}}</label>
            <span v-if="superfld.fldname!='urrlcs'"><a @click="ysort(superfld)" @dblclick="ysortdbl()">{{sortinds[superfld.sortdir]}}{{superfld.sortrank}}</a></span>
          </th>
        </tr>
        <tr v-for="obj in objs" v-bind:class="obj.kclass">
          <td v-if="fld.fldname!='rlcs' && fld.fldname!='urrlcs'" v-for="fld in superflds">{{obj[fld.fldname]}}</td>
          <!--<td><a href="" v-on:click="showDetail(obj)">Detail</a></td>-->
          <td><span v-for="rlc in obj.rlcs">{{rlc}}&nbsp</span></td>
          <!--<td><a v-for="urrlc in obj.urrlcs" @click="release(obj, urrlc)">{{urrlc}}</a></td>-->
          <td><span v-for="urrlc in obj.urrlcs"><a @click="release(obj, urrlc)">{{urrlc}}</a>&nbsp</span>
        </tr>
      </table>
      <p v-if="totalpages>1">
        <span>Total page: {{totalpages}}</span>
        <a v-if="page>1" @click="pageturn(-1)">Prev</a><input v-model="page" @keyup.enter="pageturn(0)"><a
        v-if="page<totalpages" @click="pageturn(1)">Next</a>
      </p>
      <p>&nbsp</p>
      <!--<p><a v-for="page in pages" @click="fetchpage(page)">{{}}</a></p>-->
    </div>
  </div>
</template>
<style>
  #tobjs {
    margin: 0 auto;
    border-collapse: collapse;
  }

  .zerror {
    background: gray;
  }
  #tobjs, #tobjs th, #tobjs td {
    border: solid 1px black;
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
  import valdial from './valdial.vue'
  import deepcopy from 'deepcopy'
  //Example of of returned otfs:
  //  var a = {"rlc":[{"ot":1,"rlc":"a-","fromstc":"0","tostc":"-","cond":"ekko.ekorg like 'CNC%'"},
  //                  {"ot":1,"rlc":"a0","fromstc":"0","tostc":"a0","cond":"ekko.ekorg like 'CNC%'"},
  //                  {"ot":1,"rlc":"a0-","fromstc":"a0","tostc":"-","cond":""},
  //                  {"ot":1,"rlc":"a0z","fromstc":"a0","tostc":"z","cond":""},
  //                  {"ot":1,"rlc":"b-","fromstc":"0","tostc":"-","cond":"ekko.ekorg = 'EAI' or ekko.ekorg = 'SAP'"},
  //                  {"ot":1,"rlc":"b0","fromstc":"0","tostc":"b0","cond":"ekko.ekorg = 'EAI' or ekko.ekorg = 'SAP'"},
  //                  {"ot":1,"rlc":"b0-","fromstc":"b0","tostc":"-","cond":""},
  //                  {"ot":1,"rlc":"b0z","fromstc":"b0","tostc":"z","cond":"sum(ekko.netwr) < 20000"},
  //                  {"ot":1,"rlc":"b1","fromstc":"b0","tostc":"b1","cond":"sum(ekko.netwr) >= 20000"},
  //                  {"ot":1,"rlc":"b1-","fromstc":"b1","tostc":"-","cond":""},
  //                  {"ot":1,"rlc":"b1z","fromstc":"b1","tostc":"z","cond":""}],
  //          "tbl":[{"ot":1,"tblname":"ekko","suptblname":"",
  //                  "flds":[{"tblname":"ekko","fldname":"ebeln"},{"tblname":"ekko","fldname":"ekorg"},{"tblname":"ekko","fldname":"frgzu"},
  //                          {"tblname":"ekko","fldname":"lifnr"},{"tblname":"ekko","fldname":"netwr"},{"tblname":"ekko","fldname":"reswk"},
  //                          {"tblname":"ekko","fldname":"zterm"}]
  //                  },
  //                  {"ot":1,"tblname":"ekpo","suptblname":"ekko",
  //                    "flds":[{"tblname":"ekpo","fldname":"bprme"},
  //                            {"tblname":"ekpo","fldname":"bpumn"},{"tblname":"ekpo","fldname":"bpumz"},{"tblname":"ekpo","fldname":"ebeln"},{"tblname":"ekpo","fldname":"ebelp"},
  //                            {"tblname":"ekpo","fldname":"matnr"},{"tblname":"ekpo","fldname":"meins"},{"tblname":"ekpo","fldname":"menge"},{"tblname":"ekpo","fldname":"netpr"},
  //                            {"tblname":"ekpo","fldname":"netwr"},{"tblname":"ekpo","fldname":"peinh"}]
  //                  }]
  //  }
  export default {
    props: ['vbizUinfo'],
    data: function () {
      return {
        comparatorsl: [{'value': '<=', 'name': 'Less equal'}, {'value': '>=', 'name': 'Greater eqaual'},
          {'value': '<', 'name': 'Less than'}, {'value': '>', 'name': 'Greater than'},
          {'value': '=', 'name': 'Equal to'}, {'value': 'nn', 'name': ''}],
        comparatorsh: [{'value': '<=', 'name': 'Less equal'},
          {'value': '<', 'name': 'Less than'},
          {'value': 'nn', 'name': ''}],
        locales: ['cn', 'en-US'],
        sortinds: {'asc': '🡩', 'desc': '🡫', '': '↔'},
        dateformats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
        lts: [{'lt': safe.txttaskonly, 'name': 'todo'}, {'lt': safe.txttaskrel, 'name': 'Relevant'}, {'lt': safe.txttaskall, 'name': 'all'}],
        objs: [],
        ots: [],
        otfs: [], //[{name: 'SO field 1'}, {name: 'SO field 2'}],
        superflds: [],
        sortflds: [],
        selectedot: this.vbizUinfo.autolist > 0 ? this.vbizUinfo.autolist : -1,
        listtype: this.vbizUinfo.lt,
        pagesize: 50,
        reccnts: 0,
        totalpages: 0,
        page: 1,
        reqcol: {'fldname': ''},
        reqcolopt: 0,
        showdial: false,
        author: 'Yetaai'
      }
    },
    components: {
      valdial
    },
    methods: {
      pageturn: function (paction) {
        var numaction = parseInt(paction)
        var numpage = parseInt(this.page)
        if (numpage + numaction > 0 && numpage + numaction <= this.totalpages) {
          this.page = numpage + numaction
        } else if (this.page > this.totalpages) {
          this.page = this.totalpages
        }

        this.getobjs(this.selectedot)
      },
      ysort: function (pfn) {
        if (pfn.sortrank === undefined || pfn.sortrank <= 0) {
          if (this.sortflds.length === 0) {
            pfn.sortrank = 1
          } else {
            pfn.sortrank = this.sortflds[this.sortflds.length - 1].sortrank + 1
          }
          pfn.sortdir = 'asc'
          this.sortflds.push(pfn)
        } else if (pfn.sortrank > 0) {
          if (pfn.sortdir === 'asc') {
            pfn.sortdir = 'desc'
          } else if (pfn.sortdir === 'desc') {
            pfn.sortrank = 0
            pfn.sortdir = ''
            var ind = this.sortflds.indexOf(pfn)
            this.sortflds.splice(ind, 1)
          }
        }
      },
      sortlocal: function () {
        var round = 0
        var vm = this
        vm.objs.sort(function (o1, o2) {
          var sf
          round++
          console.log(round.toString() + '====o1: ' + JSON.stringify(o1))
          console.log(round.toString() + '====o2: ' + JSON.stringify(o2))
          for (var i in vm.sortflds) {
            sf = vm.sortflds[i]
            if (sf.sortdir == 'asc') {
              if (o1[sf.fldname] == undefined || o1[sf.fldname == null]) {
                if (o2[sf.fldname] == undefined || o2(sf.fldname == null)) {
                  continue
                } else {
                  return -1
                }
              } else {
                if (o2[sf.fldname] == undefined || o2[sf.fldname] == null) {
                  return 1
                } else {
                  if (o1[sf.fldname] == o2[sf.fldname]) {
                    continue
                  } else {
                    if (o1[sf.fldname] > o2[sf.fldname]) {
                      return 1
                    } else {
                      return -1
                    }
                  }
                }
              }
            } else if (sf.sortdir == 'desc') {
              if (o1[sf.fldname] == undefined || o1[sf.fldname == null]) {
                if (o2[sf.fldname] == undefined || o2(sf.fldname == null)) {
                  continue
                } else {
                  return 1
                }
              } else {
                if (o2[sf.fldname] == undefined || o2[sf.fldname] == null) {
                  return -1
                } else {
                  if (o1[sf.fldname] == o2[sf.fldname]) {
                    continue
                  } else {
                    if (o1[sf.fldname] > o2[sf.fldname]) {
                      return -1
                    } else {
                      return 1
                    }
                  }
                }
              }
            }
          }
          return 0
        })
      },
      updateU: function () {
        var formjson = {}
        formjson.uinfo = {}
//        Object.assign(formjson.uinfo, this.vbizUinfo)
        formjson.uinfo.u = this.vbizUinfo.u
        formjson.uinfo.locale = this.locale
        formjson.uinfo.lt = this.listtype
        formjson.uinfo.autolist = this.selectedot
        formjson.uinfo.cookiedays = this.cookiedays
        formjson.uinfo.dateformat = this.dateformat
        formjson.uinfo.pagesize = this.pagesize
        var vm = this

        axios.post('/u/upd', formjson).then(function (res) {
            vm.vbizUinfo.locale = vm.locale
            vm.vbizUinfo.lt = vm.listtype
            vm.vbizUinfo.autolist = vm.selectedot
            vm.vbizUinfo.cookiedays = vm.cookiedays
            vm.vbizUinfo.dateformat = vm.dateformat
            vm.vbizUinfo.pagesize = vm.pagesize
            vm.getFlds()
//            vm.getobjs(this.selectedot)
        }).catch(function(e) {
//          alert('Failed to update your locale. do nothing. err: ' + e)
        })
      },
      ysortdbl: function () {
        for (var i in this.sortflds) {
          this.sortflds[i].sortrank = 0
          this.sortflds[i].sortdir = ''
        }
        this.sortflds = []
      },
      changeot: function () {
        if (this.selectedot <= 0) {
          alert('Please select an Object Type existing')
        } else {
          this.getFlds()
        }
      },
      clearhigh(field) {
        if (field.highoption === 'nn') {
          field.highval = ''
        }
      },
      inputhelp: function (field, lowhigh) { //low: 0, high: 1
        try {
          var low = 0
          var high = 1
          if (this.showdial) {
            if (field.fldname === this.reqcol.fldname) {
              this.reqcol = {'fldname': ''}
              this.showdial = false
              this.reqcolopt = low
            } else {
              //do nothing
            }
          } else {
            this.showdial = true
            this.reqcol = field
            this.reqcolopt = lowhigh
          }
        } catch (e) {
          window.alert(e)
        }
      },
      closehelp: function () {
        this.reqcol = {'fldname': ''}
        this.showdial = false
        this.reqcolopt = 0
      },
      getobjs: function (pOt) {
        if (this.showdial) {
          return
        }
        var vm = this
        var formjson = {}
        formjson.ots = {}
        formjson.ots[pOt.toString()] = {}
        formjson.ots[pOt.toString()].superflds = this.superflds
        formjson.ots[pOt.toString()].otfs = this.otfs
        formjson.uinfo = this.vbizUinfo
        formjson.ots[pOt.toString()].page = this.page
        formjson.ots[pOt.toString()].totalpages = this.totalpages
        if (this.sortflds != undefined && this.sortflds.length > 0) {
          formjson.ots[pOt.toString()].sortflds = this.sortflds
        }
        axios.post('/getobjs', formjson).then(function (res) {
          vm.objs = res.data[pOt.toString()].objs

//          this.otfs = res.data.ots[pOt.toString()].otfs
          vm.totalpages = res.data[pOt.toString()].totalpages
          vm.page = res.data[pOt.toString()].page
          vm.reccnts = res.data[pOt.toString()].reccnts
        }).catch(function (err) {
          console.log('getobjs error in vbiz.vue: ' + err)
        })
      },
      release: function (pObj, pRlc) {
        this.closehelp()
        pObj.errmsg = undefined
        var vm = this
        var formjson = {}
        formjson.obj = pObj
        formjson.rlc = pRlc
        formjson.uinfo = this.vbizUinfo
        formjson.ot = this.selectedot
        formjson[safe.u] = ycookie.get(safe.u)
        formjson[safe.user] = ycookie.get(safe.user)
        formjson[safe.token] = ycookie.get(safe.token)
        formjson[safe.agent] = ycookie.get(safe.agent)
        formjson[safe.timekey] = ycookie.get(safe.timekey)
        formjson.comment = 'Still testing.'
        axios.post('/process', formjson).then(function (res) {
          try {
            for (var i in vm.superflds) {
              pObj[vm.superflds[i].fldname] = res.data[vm.superflds[i].fldname]
            }
            if (res.data.urrlcs == undefined || res.data.urrlcs.length == 0) {
              if (vm.listtype == '1') {
                var pos = -1
                var eql
                var item
                for (var ii in vm.objs) {
                  eql = true
                  item = vm.objs[ii]
                  var jitem
                  for (var j in vm.otfs) {
                    jitem = vm.otfs[j]
                    if (jitem.iskey && (item[jitem.fldname] != pObj[jitem.fldname])) {
                      eql = false
                    }
                  }
                  if (eql) {
                    pos = ii
                    break
                  }
                }
                if (pos > 0) {
                  vm.objs.splice(pos, 1)
                  vm.$forceUpdate()
                }
              }
            }
          } catch (e) {
//            window.alert(e)
          }
        }, function (res) {
          pObj.kclass = 'zerror'
          vm.$forceUpdate()
//          vm.objs.forEach(function(item, i) {
//            var eql = true
//            for (var j in vm.otfs) {
//              if (j.iskey && (item[j.fldname] != pObj[j.fldname])) {
//                eql = false
//              }
//            }
//            if (eql) {
//              item.kclass = 'zerror'
//            }
//          })
        })
      },
      getFlds() {
//        console.log('all: ' + this.vbizUinfo)
//        console.log('u: ' + this.vbizUinfo.u)
//        console.log('name: ' + this.vbizUinfo.name)
//        console.log('role: ' + this.vbizUinfo.role)
//        console.log('ot: ' + JSON.stringify(this.vbizUinfo.ot))
//        console.log('rlc: ' + this.vbizUinfo.rlc)
//        console.log('org: ' + this.vbizUinfo.org)
        this.ots = this.vbizUinfo.ot
        var vm = this
        var formjson = {}
        formjson.ot = {}
        for (var i in this.ots) {
          var ot = this.ots[i].ot
          formjson.ot[i] = ot
        }
        formjson['locale'] = this.locale
        formjson['dateformat'] = this.dateformat
        formjson['pagesize'] = this.pagesize
        formjson['listtype'] = this.listtype
        formjson['orderby'] = this.orderby
        axios.post('/otfs', formjson).then(function (res) {
          vm.otfs = []
          for (var i in res.data) {
            if (i == vm.selectedot) {
              for (var j in res.data[i].tbl) {
                var onetbl = res.data[i].tbl[j]
                if (!yutil.issetnonspace(onetbl.suptblname)) {
                  for (var k in onetbl.flds) {
                    var onefld = onetbl.flds[k]
                    onefld['lowoption'] = 'nn'
                    onefld['highoption'] = 'nn'
                    onefld['sortrank'] = 0
                    onefld['sortdir'] = ''
                    vm.otfs.push(onefld)
                  }
                }
              }
            }
          }
          try {
            vm.superflds = deepcopy(vm.otfs)
          } catch (err) {
            console.log('err of deepcopy: ' + err)
          }
          //Push hard coded fields into superflds like last step, last modified, etc. Might need to clear otfs from very beginning.
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'laststc',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Status'
          })
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'lastu',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Last change by'
          })
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'lastrlctime',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Last Changed'
          })
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'lastrlc',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Last rel. code'
          })
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'rlcs',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Obj Rlcs'
          })
          vm.superflds.push({
            'tblname': 'ekko',
            'fldname': 'urrlcs',
            'sortrank': '0',
            'sortdir': '',
            'highoption': 'nn',
            'txt': 'Your Rlcs'
          })
        })
      }
    },
    events: {
      'showDialog': function (show) {
        this.showdial = show
      }
    },
    created: function () {
      this.locale = this.vbizUinfo.locale
      this.dateformat = this.vbizUinfo.dateformat
      this.pagesize = this.vbizUinfo.pagesize
      this.ots = this.vbizUinfo.ot
      if (this.selectedot > 0) {
        this.getFlds()
      }
    }
  }
</script>
