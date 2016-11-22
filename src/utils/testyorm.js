/**
 * Created by ddongjin on 10/19/2016.
 */
var pool = require('../utils/pool');
var yorm = require('../yorm/yorm');
var Promise = require("bluebird");
var biz = require('../utils/biz');

var t1 = function () { //Testing tbldefs, saveone, savemany
  return new Promise(function (resolve, reject) {
    yorm.tbldefs(pool, ["zz1", "zz2"]).then(function (values) {
      // console.log("json.stringify tbldefs: " + JSON.stringify(values))
      yorm.saveone(pool, "zz1", values["zz1"], {"zz1": "1", "f1": "test orm", "f2": "f2", "f3": null})
        .then(function (values1) {
          console.log("saveone success");
          pool.getConnection(function (err, conn) {
            conn.query("select zz1, f1, f2, f3 from zz1", function (err1, rs) {
              var l = rs.length;
              var newrs = [];
              var oner;
              var k = l;
              while(true) {
                if (k > 220) break;
                oner = new Object();
                Object.assign(oner, rs[k % l]);
                oner.zz2 = k++;
                oner.f1 = "21";
                oner.f2 = "3.1"
                newrs.push(oner);
              }
              for (var i in newrs) {
                console.log("newrs zz2/f1: " + newrs[i].zz2 + "/" + newrs[i].f1)
              }
              console.log("total records: " + newrs.length);
              yorm.savemany(pool, "zz2", values["zz2"], newrs, true)
                .then(function (values1) {
                  console.log("savemany success")
                  resolve("resolved after savemany");
                })
                .catch(function (err2) {
                  console.log(err2 + " in savemany");
                  reject(err2 + " in savemany");
                });
            })
          })
        }).catch(function (err1) {
          console.log(err1 + " in saveone")
          reject(err1);
        });
    })
  })
}

var t2 = function() { //Testing getMany, refreshByKey, tbldefs
  return new Promise(function(resolve, reject) {
    yorm.tbldefs(pool, ["zz1", "zz2"]).then(function(defs) {
      var objs = [];
      yorm.getMany(pool, "zz2", defs, " where zz2 > 3 and zz2 < 67").then(function(objs) {
        for (var i in objs) {
          if (i == 5) {objs[i].f2 = "20"; continue;}
          if (i == 3) {objs[i].f1 = "71"; objs[i].f2 = "71"; objs[i].f3 = "71"; continue}
          objs[i].f3 = "-1";
          objs[i].f2 = -1.1;
          objs[i].f1 = "21";
        }
        for (var i in objs) {
          if ( i > 11) continue;
          console.log("objs[" + i + "] before refresh: " + objs[i].zz2 + "/" + objs[i].f1 + "/" + objs[i].f2 + "/" + objs[i].f3);
        }
        yorm.refreshByKey(pool, "zz2", defs, objs, ["f2"], {"zz2":"asc", "f1":"desc"}, 50).then(function(v1) {
          for (var i in objs) {
            if (i < 10)
            console.log("objs[" + i + "] after refresh: " + objs[i].zz2 + "/" + objs[i].f1 + "/" + objs[i].f2 + "/" + objs[i].f3);
          }
          resolve("resolved");
        });
      });
    })
  });
}

var t3 = function() {//getone //refreshone
  return new Promise(function(resolve, reject) {
    yorm.tbldefs(pool, ["zz1", "zz2"]).then(function(tbldefs) {
      yorm.getone(pool, "zz2", tbldefs["zz2"], [11, 21]).then(function(zz2) {
        zz2.f2 = 33;
        zz2.f3 = "2";
        yorm.refreshOne(pool, "zz2", tbldefs["zz2"], zz2).then (function(v2) {
          console.log("zz2 json: " + JSON.stringify(zz2));
        });
      });
    })
  });
}

var t4 = function() {
  yorm.tbldefs(pool, ["zz1", "zz2"]).then(function(value) {console.log(JSON.stringify(value))});
  // console.log(JSON.stringify(biz.tbldefs));
  // var i = 0;
  // while (i < 10) {
  //   setInterval(function(){console.log(JSON.stringify(biz.tbldefs))}, 1000)
  //   i ++;
  // }
};

var t5 = function(seconds) {
  // var j = 0;
  // for (var i = 0; i < 1000 * 1000 * millions; i ++) {
  //   j++;
  // }
  var start = Date.now();
  console.log("Time 0: " + start);
  var a = function() {
    console.log("5 seconds later: " + JSON.stringify(biz.tbldefs));
    var realtime = Date.now();
    var diff = realtime - start;
    console.log("realtime: " + diff);
  }
  // console.log(JSON.stringify((biz.tbldefs)));
  setTimeout(a,  seconds * 1000);
}(1);

// var tz1 = function() {
//   var a = {};
//   a["a"] = {};
//   a["a"]["a"] = "aaa.aaa";
//   a["a"]["b"] = "aaa.bbb";
//   a["b"] = "bbb";
//   console.log("a['a']: " + a["a"]);
//   console.log("a.a: " + a.a);
//   console.log("a['a']['a']: " + a["a"]["a"]);
//   console.log("a.a.a: " + a.a.a);
//   console.log("a.a.b: " + a.a.b);
//   console.log("a.b:" + a.b);
// };
// tz1();
// t1().then(function(value){console.log("value: " + value); process.exit(0)}).catch(function(err) {console.log(err); process.exit(-1)});
// t2().then(function(v) {console.log("value: " + v); process.exit(0)}).catch(function(err) {console.log(err); process.exit(-1)});
// t3();
