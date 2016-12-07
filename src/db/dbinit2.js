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

yorm.bufferinit().then(function (){
  return new Promise(function(resolve, reject) {
    yorm.getmany('txts', '').then(function(txts){
      var dictzh = {}
      dictzh.tblname = '表名'
      dictzh.fldname = '字段名'
      dictzh.reswk = '供货工厂'
      dictzh.comment = '注解'
      dictzh.ekorg = '采购组织'
      dictzh.stc = '状态码'
      dictzh.laststc = '最近状态码'
      dictzh.ebeln = '采购订单'
      dictzh.frgzu = 'SAP状态'
      dictzh.lifnr = '供应商'
      dictzh.kunnr = '客户号'
      dictzh.zterm = '付款方式'
      var dicten_US = {}
      dicten_US.tblname = 'Tbl name'
      dicten_US.fldname = 'Fld name'
      dicten_US.reswk = 'Supply Plt'
      dicten_US.comment = 'Comment'
      dicten_US.ekorg = 'POrg'
      dicten_US.stc = 'St code'
      dicten_US.laststc = 'Last stc'
      dicten_US.ebeln = 'PO'
      dicten_US.frgzu = 'SAP status'
      dicten_US.lifnr = 'Vendor'
      dicten_US.kunnr = 'Cust no.'
      dicten_US.zterm = 'Pay term'
      var t
      for (var i in txts) {
        t = txts[i]
        if (t.fldname && t.locale == 'cn') {
          t.txt = dictzh[t.fldname.trim().toLowerCase()]
        } else if (t.fldname && t.locale == 'en-US') {
          t.txt = dicten_US[t.fldname.trim().toLowerCase()]
        }
      }
      yorm.savemany('txts', txts, 0, true).then(function() {
        reject("Transalte txts successfully. Testing right now, so no more testing data.")
      }).catch(function(e) {
        reject("====Failed to translate txts table: " + e)
      })
    }).catch(function(e) {
      reject('Error in dbinit2: ' + e)
    })
  })
}).then(function() {
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
}).catch(function(e) {
  console.log("Finally print error: " + e)
  process.exit(2)
})

// var test = function() {
//   console.log('yorm.tbldefs by settimeout: ' + JSON.stringify(yorm.tbldefs))
// }
// setTimeout(test, 2000)
