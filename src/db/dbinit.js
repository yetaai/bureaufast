/**
 * Created by oefish on 10/1/2016.
 */
var child = require('child_process');
var pool = require('../yorm/pool');
var yorm = require('../yorm/yorm')
// var bcrypt = require('bcrypt-nodejs');
// var md5 = require('blueimp-md5');
var sha256 = require('sha256');
var Promise = require('bluebird');

var psTree = require('ps-tree');
var safe = require('../assets/secret')

var kill = function (pid, signal, callback) {
  signal = signal || 'SIGKILL';
  callback = callback || function () {
    };
  var killTree = true;
  if (killTree) {
    psTree(pid, function (err, children) {
      [pid].concat(
        children.map(function (p) {
          return p.PID;
        })
      ).forEach(function (tpid) {
        try {
          process.kill(tpid, signal)
        }
        catch (ex) {
        }
      });
      callback();
    });
  } else {
    try {
      process.kill(pid, signal)
    }
    catch (ex) {
    }
    callback();
  }
};
var getconfig = function () {
  return new Promise(function (resolve1, reject1) {
    var result = {}
    var getorg = new Promise(function (resolve, reject) {
      pool.getConnection(function (err, conn) {
        conn.query('select distinct org from roleorg', [], function (err1, rs) {
          result.org = []
          for (var i in rs) {
            result.org.push(rs[i].org)
          }
          resolve()
        })
      })
    })
    var getrole = new Promise(function (resolve, reject) {
      pool.getConnection(function (err, conn) {
        conn.query('select distinct role from roleorg', [], function (err1, rs) {
          result.role = []
          for (var i in rs) {
            result.role.push(rs[i].role)
          }
          resolve()
        })
      })
    })
    yorm.bufferinit().then(function () {
      result.tbldefs = yorm.tbldefs
      Promise.all([getorg, getrole]).then(function () {
        result.lifnr = ['300000', '1111', 'abcde', 'US DOD', 'Red Cross', 'Bin Ladon']
        result.reswk = ['U372', 'B978', 'J201', 'CN33']
        result.zterm = ['D030', 'W02', 'Y1', 'W03', 'W03A']
        resolve1(result)
      }).catch(function (e) {
        console.log('error happended in dbinit.getconfig: ' + e)
      })
    })
  })
}
var popuot1 = function () {
  return new Promise(function (resolve, reject) {
    getconfig().then(function (result) {
      var ones = []
      var one
      var step = 4500000003
      var org = result.org
      console.log('org: ' + JSON.stringify(org))
      var role = result.role
      var lifnr = result.lifnr
      var reswk = result.reswk
      var zterm = result.zterm
      for (var i = 0; i < 3000; i++) {
        var r1to3 = Math.floor(Math.random() * 2) + 1
        var randorg = org[Math.floor(Math.random() * org.length)]
        var randrole = role[Math.floor(Math.random() * role.length)]
        var randlifnr = lifnr[Math.floor(Math.random() * lifnr.length)]
        var randreswk = reswk[Math.floor(Math.random() * reswk.length)]
        var randzterm = zterm[Math.floor(Math.random() * zterm.length)]
        step = step + r1to3
        one = {}
        one.ebeln = step.toString()
        one.yorg = randorg
        one.ekorg = randorg
        one.frgzu = String.fromCharCode('a'.charCodeAt(0) + r1to3)
        one.lifnr = randlifnr
        one.reswk = randreswk
        one.zterm = randzterm
        ones.push(one)
      }
      yorm.savemany('ot1ekko', ones, 2000, true).then(function () {
        console.log("resolved popuot1")
        resolve()
      }).catch(function (e) {
        console.log('Error when popuopt1' + e)
        reject(e)
      })
    }).catch(function (e) {
      console.log('Errow when popu opt1' + e)
      reject(e)
    })
  })
}
var popunextrlc = function () {
  return new Promise(function (resolve, reject) {
    console.log("Populating next rlcs. Shall after popuot1 resolve")
    var veripros = []
    yorm.bufferinit().then(function () {
      // console.log('in dbinit.popunextrlc. yorm.tbldefs: ' + JSON.stringify(yorm.tbldefs))
      yorm.getmany('ot', '').then(function (rsot) {
        var ot
        var pros = []
        for (var i in rsot) {
          ot = rsot[i].ot
          pros.push(function(pot) {
            return new Promise(function(resolve1, reject1) {
              yorm.getmany('ots', 'where ot = "' + pot + '" and (suptblname is null or suptblname = "")').then(function (ots) {
                var htable
                for (var j in ots) {
                  htable = 'ot' + pot + ots[j].tblname
                  break
                }
                yorm.getmany(htable, '').then(function (objs) {
                  if (objs.length < 1) {
                    return
                  } else {
                    console.log('Number of objs: ' + objs.length + ' for object type: ' + pot)
                  }
                  var objnextrlcs = []
                  var objnextrlc
                  var ntable = 'yot' + pot + 'next'

                  Promise.mapSeries(objs, function (obj) {
                    return new Promise(function(resolve2, reject2) {
                      if (obj.laststc == undefined || obj.laststc == null) {
                        obj.laststc = 0
                      }
                      if (obj.laststc != 0) {
                        console.log('non-zero initial stc: ' + obj.laststc)
                      }
                      yorm.getmany('otrlc', ' where ot = "' + pot + '" and fromstc = "' + obj.laststc + '"').then(function (objrlcs) {
                        var tbldef = yorm.tbldefs[htable]
                        var ssql = ''
                        var swhere0 = ' where '
                        for (var k0 in tbldef.pricols) {
                          swhere0 = swhere0 + tbldef.pricols[k0] + ' = "' + obj[tbldef.pricols[k0]] + '" and '
                        }
                        ssql = tbldef.sselect + tbldef.sfrom
                        Promise.map(objrlcs, function (objrlc) {
                          return new Promise(function(resolve3, reject3) {
                            if (objrlc.cond != undefined && objrlc.cond != null && objrlc.cond.length > 3) {
                              var swhere = swhere0 + objrlc.cond
                              yorm.query(tbldef.sselect + tbldef.sfrom + swhere).then(function(rs) {
                                if (rs.length == 0) {
                                  resolve3()
                                } else {
                                  objnextrlc = {}
                                  for (var k1 in tbldef.pricols) {
                                    objnextrlc[tbldef.pricols[k1]] = obj[tbldef.pricols[k1]]
                                  }
                                  objnextrlc['nextrlc'] = objrlc.rlc
                                  objnextrlcs.push(objnextrlc)
                                  if (objnextrlcs.length % 500 == 0) {
                                    console.log('objnextrlcs length: ' + objnextrlcs.length)
                                  }
                                  resolve3()
                                }
                              }).catch(function(e) {
                                reject3(e)
                              })
                            } else {
                              objnextrlc = {}
                              for (var k1 in tbldef.pricols) {
                                objnextrlc[tbldef.pricols[k1]] = obj[tbldef.pricols[k1]]
                              }
                              objnextrlc['nextrlc'] = objrlc.rlc
                              objnextrlcs.push(objnextrlc)
                              resolve3()
                            }
                          })
                        }, {concurrency: 6}).then(function() {
                          resolve2()
                        })
                      }).catch(function(e) {
                        reject2(e)
                      })
                    })
                  }).then(function(){
                    yorm.savemany(ntable, objnextrlcs, 1000, true).then(function() {
                      console.log('resolving object type after saving: ' + pot)
                      resolve1()
                    }, function(e) {
                      console.log('rejecting object type after saving: ' + pot + '. Error in dbinit.popunextrlc: ' + e)
                      reject1(e)
                    })
                  }).catch(function(e) {
                    console.log('dbinit.popunextrlc failed for object type')
                    reject1(e + '. ot: ' + pot)
                  })
                })
              }).catch(function(e) {
                console.log("Error in dbinit.js by getting yorm.getmany of ots: " + e)
                reject1(e)
              })
            })
          }(ot))
        }
        Promise.all(pros).then(function() {
          resolve()
        }).catch(function(e) {
          console.log('dbinit.popunextrlc. Error at end of all object type update')
          reject(e)
        })
      }).catch(function (e) {
        console.log(e)
        reject(e)
      })
    }).catch(function (e) {
      console.log(e)
      reject(e)
    })
  })
}
var dtmap = {
  "dats": "char", "char": "char", "cuky": "char", "unit": "char", "dec": "decimal",
  "quan": "decimal", "curr": "decimal"
};

var abc = function () {
  return new Promise(function (resolv, reject) {
    console.log("In abc now.");
    var ssql = 'mysql -u ' + pool.myconfig.user + ' -P ' + pool.myconfig.port + ' test < ./ddlandmore.sql';
    // child.exec('mysql -u root -P 3307 test < /home/oefish/026projects/p004objrelease/src/db/ddlandmore.sql',
//  child.exec('mysql -P 3307 test < E:\\026projects\\p003porelease\\src\\db\\ddlandmore.sql',
    child.exec(ssql,
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
          reject();
        } else {
          pool.getConnection(function (err, conn) {
            var sql = 'select u, name, password from u';
            conn.query(sql, [], function (err, users) {
              var updatesql = 'update u set password = ? where u = ?';
              k = users.length;
              j = 0;
              for (var i in users) {
                // var passhash = bcrypt.hashSync(users[i].password);
                var passhash = sha256(users[i].name);
                conn.query(updatesql, [passhash, users[i].u], function (err, data) {
                  if (error !== null) {
                    console.log('Failed to update password hash for user: ' + users[i].u.toString()
                      + users[i].name);
                  }
                  j++;
                  if (k == j) {
                    console.log('Totally ' + j.toString() + ' is listed.');
                    console.log('Totally ' + k.toString() + ' processed.');
                    resolv(1);
                  }
                })
              }
            })
          })
        }
      })
  })
}().then(function () {
  return new Promise(function (resolve, reject) {
    console.log("in abc1.....");
    pool.getConnection(function (err, conn) {
      conn.query("select a.ot, d.tblname, d.fldname, d.position, d.keyflag, d.datatype, d.leng, d.decimals" +
        " from ot a inner join ots b on a.ot = b.ot " +
        "      inner join otf c on a.ot = c.ot and b.tblname  = c.tblname" +
        "      inner join dd03l d on c.tblname = d.tblname and c.fldname = d.fldname " +
        " where d.as4local = '' or d.as4local is null order by a.ot, d.tblname, d.position, d.keyflag desc, d.fldname",
        function (err, rows) {
          if (err) {
            console.log(err.message);
            reject();
            return;
          }
          console.log("in query ot join ots, otf, dd03l. Get " + rows.length.toString() + " rows.")
          var sql = '';
          var pk = '';
          var ysql = '';
          var ynextsql = '';
          var dropsql = '';
          var dropysql = '';
          var dropynextsql = '';
          var allCreate = new Array();
          var allDrop = new Array();
          for (var i in rows) {
            if ((i > 0 && rows[i - 1].tblname != rows[i].tblname ) || i == 0) {
              if (i > 0 && rows[i - 1].tblname != rows[i].tblname) {
                ysql = ysql + " step int, u int, stc char(10), rlc char(21), rlctime timestamp, comment varchar(255), " + pk + "step));";
                ynextsql = ynextsql + " nextrlc char(21), " + pk + "nextrlc))"
                pk = pk.substr(0, pk.length - 2) + ")";
                sql = sql + " yorg char(20), laststep int, lastu int, laststc char(10), lastrlc char(21), lastrlctime char(21), " +
                  "lockedby int, lockedon timestamp, comment varchar(255), " + pk + ");"
                allDrop.push(dropsql);
                allCreate.push(sql);
                allDrop.push(dropysql);
                allCreate.push(ysql)
                allDrop.push(dropynextsql)
                allCreate.push(ynextsql)
              }
              dropsql = 'drop table if exists ot' + rows[i].ot.toString() + rows[i].tblname;
              dropysql = 'drop table if exists yot' + rows[i].ot.toString() + rows[i].tblname;
              dropynextsql = 'drop table if exists yot' + rows[i].ot.toString() + 'next';
              ysql = 'create table if not exists yot' + rows[i].ot.toString() + rows[i].tblname + '(';
              ynextsql = 'create table if not exists yot' + rows[i].ot.toString() + 'next ('
              sql = 'create table if not exists ot' + rows[i].ot.toString() + rows[i].tblname + '(';
              pk = ' primary key(';
            }
            var ft = '';
            if (dtmap[rows[i].datatype] == "decimal") {
              var fdecilen;
              if (!rows[i].decimals) {
                fdecilen = 0;
              } else {
                fdecilen = rows[i].decimals;
              }
              ft = dtmap[rows[i].datatype] + "(" + rows[i].leng.toString() + ", " + fdecilen.toString() + ")";
            } else {
              ft = dtmap[rows[i].datatype] + "(" + rows[i].leng.toString() + ")";
            }
            sql = sql + rows[i].fldname + ' ' + ft + ", ";
            if (rows[i].keyflag == 'Y') {
              ysql = ysql + rows[i].fldname + " " + ft + ", ";
              ynextsql = ynextsql + rows[i].fldname + " " + ft + ", ";
              pk = pk + rows[i].fldname + ", ";
            }
          }
          ysql = ysql + " step int, u int, stc char(10), rlc char(21), rlctime timestamp, comment varchar(255), " + pk + "step));";
          ynextsql = ynextsql + " nextrlc char(21), " + pk + "nextrlc))"
          pk = pk.substr(0, pk.length - 2) + ")";
          sql = sql + " yorg char(20), laststep int, lastu int, laststc char(10), lastrlc char(21), lastrlctime char(21), " +
            "lockedby int, lockedon timestamp, comment varchar(255), " + pk + ");"
          allDrop.push(dropsql);
          allCreate.push(sql);
          allDrop.push(dropysql);
          allCreate.push(ysql);
          allDrop.push(dropynextsql)
          allCreate.push(ynextsql)
          new Promise(function (resolve3, reject3) {
            var jcnt = 0;
            for (var j in allDrop) {
              new Promise(function (resolve5, reject5) {
                resolve5(allDrop[j]);
              }).then(function (aSql) {
                conn.query(aSql, [], function (err, data) {
                  if (err) {
                    console.log("Failed drop. SQL: " + aSql);
                    reject3();
                  } else {
                    // console.log("Good drop. SQL: " + aSql);
                    jcnt++;
                  }
                  if (jcnt == allDrop.length - 1) {
                    resolve3();
                  }
                })
              })
            }
          }).then(function (value) {
            return new Promise(function (resolve3, reject3) {
              var j1cnt = 0;
              for (var j1 in allCreate) {
                new Promise(function (resolve5, reject5) {
                  resolve5(allCreate[j1]);
                }).then(function (aCreate) {
                  conn.query(aCreate, [], function (err, data) {
                    if (err) {
                      console.log("Failed create. SQL: " + aCreate + ". " + err);
                      reject3();
                    } else {
                      // console.log("Good create. SQL: " + aCreate);
                      j1cnt++;
                    }
                    if (j1cnt == allCreate.length - 1) {
                      resolve3();
                    }
                  })
                })
              }
            })
          }).then(function () {
            conn.query('select table_name, column_name from information_schema.columns where table_schema = ?', ['test'], function (err21, rs21) {
              var sins = 'insert into txts (id, locale, txt, tblname, fldname) values '
              var i = 0;
              var sval = '(';
              var pros = [];
              for (var j in rs21) {
                var r = rs21[j]
                i++;
                if (i % 100 == 0) {
                  if (i > 1) {
                    var ssql = sins + sval.substr(0, sval.length - 3);
                    // console.log("assembled statement: " + ssql);
                    pros.push(function (pSsql) {
                      return new Promise(function (resolve22, reject22) {
                        conn.query(pSsql, [], function (err22, rs22) {
                          if (err22) {
                            reject(err22)
                          } else {
                            resolve22()
                          }
                        })
                      })
                    }(ssql))
                  }
                  sval = '(';
                }
                var tc = r.table_name + '|' + r.column_name;
                sval = sval + i + ',' + ' "en-US",  "' + tc + '", "' + r.table_name + '", "' + r.column_name + '"), ('
              }
              var ssql = sins + sval.substr(0, sval.length - 3);
              // console.log("assembled statement: " + ssql);
              pros.push(function (pSsql) {
                return new Promise(function (resolve23, reject23) {
                  conn.query(pSsql, [], function (err23, rs23) {
                    if (err23) {
                      reject(err23)
                    } else {
                      console.log('At last insert into testing POs in EKKO')
                      conn.query('insert into ot1ekko (ebeln, ekorg, frgzu, lifnr, reswk, zterm, yorg, laststep, lastu, laststc, lastrlc, lastrlctime) ' +
                        'values ("4500000002", "SAP", "sap0", "3111", "U601", "WD15", "SAP", "1", "1", "0", "0", "20161022030000"), ' +
                        '("4500000003", "EAI", "app0", "3112", "U601", "WD45", "APP", "1", "1", "0", "0", "20161025030600")', function (err24, rs24) {
                        if (err24) {
                          reject(err24)
                        } else {
                          conn.query('insert into ot2so (so, amount, customer, department, zterm, yorg, laststep, lastu, laststc, lastrlc, lastrlctime) ' +
                            'values ("a70000001", "50000", "6331", "ind", "W01", "CNC1", "1", "4", "0", "0", "20161026030700"), ' +
                            '("a70000002", "7000", "6332", "gov", "W02", "CNC2", "1", "36", "0", "0", "20161023030800")', function (err25, rs25) {
                            if (err25) {
                              reject(err25)
                            } else {
                              resolve23()
                            }
                          })
                        }
                      })
                    }
                  })
                })
              }(ssql))
              Promise.all(pros).then(function (value) {
                conn.query('update otf inner join txts on concat("ot", otf.ot, otf.tblname) = txts.tblname and otf.fldname = txts.fldname ' +
                  ' set otf.txtsid = txts.id', [], function (err31, rs31) {
                  if (err31) {
                    reject(err31)
                  }
                  conn.query('insert into txts select id, "cn", txt, tblname, fldname, comment from txts where id not in (?, ?, ?, ?, ?)', [1000000000, 1000000001, 1000100000,1000100001, 1000100002], function (err35, rs35) {
                    if (err35) {
                      reject(err35)
                    } else {
                      resolve()
                    }
                  })
                })
              }).catch(function (e) {
                console.log('error of init database: ' + e)
              })
            })
          });
        })
    })
  })
}).then(function () {
  return popuot1()
}).then(function () {
  return popunextrlc()
}).then(function () {
  process.on('exit', function (code) {
    console.log('Completed. Exiting with code: ' + code);
  });
  kill(child.pid);
  process.exit(0);
}).catch(function (err) {
  console.log(err)
  process.exit(-1)
});

