/**
 * Created by oefish on 11/16/16.
 */
var yorm = require("../yorm/yorm")
var biz = require("../utils/biz")

var uInfo = {}
uInfo.rlc = ['b-', 'b0']
// yorm.bufferinit().then(function() {
//   return new Promise(function(resolv, reject) {
//     yorm.getone('ot1ekko', ['3899999902']).then(function(obj) {
//       biz.detNextRlc(obj, 1).then(function(nextrlcs) {
//         console.log('result of nextrlcs: ' + JSON.stringify(nextrlcs))
//         resolv()
//         process.exit(0)
//       })
//     })
//   })
// })
yorm.bufferinit().then(function() {
  var p0 = yorm.getmany('ot1ekko', {'ebeln': '4500000002'})
  var p1 = yorm.getmany('yot1ekko', {'ebeln': '4500000002'})
  var p2 = yorm.getmany('yot1next', {'ebeln': '4500000002'})
  Promise.all([p0, p1, p2]).then(function([objs0, objs1, objs2]) {
    var ini = 4500000002
    var cnt = 600000000;
    var kcnt = 0
    var v0 = []
    var v1 = []
    var v2 = []
    var o
    while (kcnt < 100) {
      kcnt ++
      cnt ++
      for (var i in objs0) {
        objs0[i].ebeln = (ini - cnt).toString()
        o = {}
        Object.assign(o, objs0[i])
        o.lockedon = null
        v0.push(o)
      }
      for (var i in objs1) {
        objs1[i].ebeln = (ini - cnt).toString()
        o = {}
        Object.assign(o, objs1[i])
        o.rlctime = null
        v1.push(o)
      }
      for (var i in objs2) {
        objs2[i].ebeln = (ini - cnt).toString()
        o = {}
        Object.assign(o, objs2[i])
        v2.push(o)
      }
    }
    var p00 = yorm.savemany('ot1ekko', v0, 0, true)
    if (v1.length > 0) {
      var p01 = yorm.savemany('yot1ekko', v1, 0, true)
    }
    var p02 = yorm.savemany('yot1next', v2, 0, true)
    Promise.all([p00, p01, p02]).then(function() {
      console.log('Completed.')
      process.exit(0)
    }, function(e) {
      console.log('error: ' + e)
      console.log(e.stack)
      process.exit(1)
    })
  })
})

// var test = function() {
//   console.log('yorm.tbldefs by settimeout: ' + JSON.stringify(yorm.tbldefs))
// }
// setTimeout(test, 2000)
