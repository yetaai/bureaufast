/**
 * Created by oefish on 10/9/2016.
 */
var pool = require("../yorm/pool");
var Promise = require("bluebird")
var biz = require("./biz");
exports.getOts = function(pLocal) { // Set app.locals.markedOts
    return new Promise(function(resolve, reject) {
        var ot = function() {
            return new Promise(function(resolve1, reject1) {
                pool.getConnection(function(err, conn) {
                    if (err) {
                        reject1("DB error fetch OT");
                    } else {
                        result = [];
                        conn.query("select ot, name from ot order by ot", [], function(err, rows) {
                            for (var i in rows) {
                                result.push(rows[i]);
                                // result.push({"ot" : rows[i].ot
                                //     , "name" : rows[i].name});
                            }
                        })
                        resolve1(result);
                    }
                })
            })
        }
        var ots = function() {
            return new Promise(function(resolve1, reject1) {
                pool.getConnection(function(err, conn) {
                  if (err) {
                      console.log(err);
                      reject1("DB error fetching OTS")
                  } else {
                      var result = [];
                      conn.query("select ot, tblname, suptblname from ots order by ot, suptblname", [], function(err, rows) {
                          if (err) {
                              reject1(err);
                          }
                          for (var i in rows) {
                              result.push(rows[i]);
                              // result.push({"ot": rows[i].ot,
                              //     "tblname" : rows[i].tblname,
                              //     "suptblname" : rows[i].suptblname});
                          }
                          resolve1(result);
                      })
                  }
                })
            })
        }
        Promise.join(ot(), ots()).then(function(values) {
            var j = 0;
            var oneOts = [];
            var result = [];
            console.log(values)
            // console.log(values.ot);
            // console.log(values.ots)
            labelot: for (var i in values[0]) {
                if (j >= values[1].length - 1) {
                    break labelot;
                } else {
                    while (values[1][j].ot == values[0][i].ot) {
                        oneOts.push(values[1][j++]);
                        if (j >= values[1].length) {
                            break;
                        }
                    }
                    r1 = biz.otsMarkDepth(oneOts);
                    result[i] =  r1;
                    // console.log("result length: " + result.length + ". i = " + i);
                    // console.log(result[i]);
                    oneOts = [];
                }
            }
            pLocal.markedOts = result;
            resolve(result);
        }).catch(function(err) {
            reject(err);
        })
})};
