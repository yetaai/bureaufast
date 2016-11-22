/**
 * Created by oefish on 10/4/2016.
 */
var Promise = require('bluebird');
var pool = require('../yorm/pool');
var utils = require('./yutils')
var bs = require('binary-search');
var sha256 = require('sha256');
var yorm = require('../yorm/yorm');
var safe = require('../assets/secret')

module.exports.genOtHeadSelect = function (ot, ots, otf, filter, filterjoiner) { //Return SQL string to select. Filter would be concated by And and brackets.
  for (var i0 in ots) {
    if (ot == ots[i0].ot && !ots[i0].suptblname) {
      var result = 'select ';
      for (var i1 in otf) {
        if (otf[i1].tblname = ots[i0].tblname) {
          result = result + otf[i1].fldname + ", "
        }
      }
      result = result.substr(0, result.length - 2);
      result = result + " from " + ots[i0].tblname;
      if (filter) {
        result = result + " where ";
        joiner = filterjoiner ? filterjoiner : "and";
        for (var i2 in filter) {
          if (i2 == 0) {
            result = result + "(" + filter[i2] + ") "; // Either and or or.
          } else {
            result = result + joiner + " (" + filter[i2] + ") "; // Either and or or.
          }
        }
      }
      return result;
    }
  }
  return null;
};

module.exports.genOtItemSelect = function (ot, ots, otf, tblname) {
  var suptblname = "";
  for (var i in ots) {
    if (ot == ots[i].ot && ots[i].tblname == tblname) {
      suptblname = ots[i].suptblname;
      break;
    }
  }
  keyFields = [];
  for (var i in otf) {
    if (ot == otf[i].ot && otf[i].tblname == suptblname) {
      keyFields.push(otf[i].fldname);
    }
  }
  for (var i0 in ots) { //Ot is a single object type.
    if (ot == ots[i0].ot && ots[i0].tblname == tblname) {
      var result = 'select ';
      for (var i1 in otf) {
        if (otf[i1].tblname == ots[i0].tblname) {
          result = result + otf[i1].fldname + ", "
        }
      }
      result = result.substr(0, result.length - 2);
      result = result + " from " + tblname;
      if (keyFields) {
        result = result + " where ";
        joine = " and ";
        for (var i2 in keyFields) {
          result = result + "(" + keyFields[i2] + " = ? ) " + filterjoiner + " "; // Either and or or.
        }
        result = result.substr(0, result.length - 4);
      }
      return result;
    }
  }
};

module.exports.myworkinglist = function (ot, uinfo, ots, otf) { //Todo 2016-10-12 20:31:41
};

module.exports.datahistory = function (ot, objkey, ots, otstree, uinfo) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (err) {
        reject(err);
      } else {
        var headtblname = otstree.tblname;
        var sselect = "select ";
        var swhere = " where ";
        for (var i in otstree.flds) {
          if (otstree.flds[i].iskey) {
            swhere = swhere + otstree.flds[i].fldname + " = ? and "
          }
          sselect = sselect + otstree.flds[i].fldname + ", ";
        }
        sselect = sselect.substr(0, sselect.length - 2);
        var sfrom = " from yot" + ot + headtblname;
        swhere = swhere.substr(0, swhere.length - 4);
        conn.query(sselect + sform + swhere, objkey, function (err, rs) {
          if (err) {
            reject(err)
          } else {
            result = [];
            for (var i in rs) {
              onerec = {};
              onerec[otstree.flds[i]] = rs[i][otstree.flds[i]];
              result.push(onerec)
            }
            resolve(result);
          }
        });
      }
    })
  })
}

module.exports.dataone = function (ot, objKey, ots, otstree, uinfo) {
  return new Promise(function (resolve, reject) {
    results = [];
    swhere = " where ";
    for (var j in ots[0]) {
      var tfld = ots[0].flds[j];
      if (onefld.iskey) {
        swhere = swhere + tfld.fldname + " = ? " + " and ";
      }
    }
    swhere = swhere.substr(0, swhere.length - 4);
    for (var i in ots) {
      var onetbl = ots[i];
      var ssql = "select ";
      var swhere = " where "
      for (var j in onetbl) {
        var onefld = onetbl.flds[j];
        if (onefld.iskey) {
          ssql = ssql + onefld.fldname + ",";
        }
      }
      ssql = ssql.substr(0, ssql.length - 1) + " from " + onetbl.tblname;
      pool.getConnection(function (err, conn) {
        if (err) {
          reject(err)
        } else {
          conn.query(ssql, objKey, function (err, rs) {
            k1 = {};
            k1[onetbl.tblname] = rs;
            results.push(k1);
            resolve(results);
          })
        }
      })
    }
  }).then(function (oneset) {
    return new Promise(function (resolve, reject) {
      var root = otstree;
      var path = [];
      var ifback = false;
      var curr = root;
      var supnode;
      var result1 = oneset[curr.tblname];
      while (true) {
        if (!ifback) {
          if (curr.kdis && curr.kids.length() > 0) {
            path.push(0);
            ifback = false;
            supnode = curr;
            var supflds = supnode.flds;
            var suptblname = supnode.tblname;
            var datasup = oneset[supnode.tblname];
            curr = curr.kids[0];
            var currflds = curr.flds;
            var currtblname = curr.tblname;
            var datacurr = oneset[curr.tblname];
            for (var i in datasup) {
              datasup[i].datakids = [];
              for (var j in datacurr) {
                var keymatch = true;
                for (var k in supflds) {
                  if (supflds[k].iskey) {
                    keymatch = keymatch && (datasup[supflds[k].fldname] == datacurr[supflds[k].fldname])
                  }
                }
                if (keymatch) {
                  datasup[i].datakids.push(datacurr[j]);
                }
              }
            }
          } else {
            var i = path[path.length - 1] + 1;
            if (i >= curr.supnode.kids.length) {
              path.pop();
              curr = curr.supnode;
              ifback = true;
              if (path.length == 0) break;
            } else {
              ifback = false;
              path[path.length - 1] = i;
              curr = curr.supnode.kids[i];
              supnode = curr.supnode;
              var supflds = supnode.flds;
              var suptblname = supnode.tblname;
              var datasup = oneset[supnode.tblname];
              var currflds = curr.flds;
              var currtblname = curr.tblname;
              var datacurr = oneset[curr.tblname];
              for (var i in datasup) {
                datasup[i].datakids = [];
                for (var j in datacurr) {
                  var keymatch = true;
                  for (var k in supflds) {
                    if (supflds[k].iskey) {
                      keymatch = keymatch && (datasup[supflds[k].fldname] == datacurr[supflds[k].fldname])
                    }
                  }
                  if (keymatch) {
                    datasup[i].datakids.push(datacurr[j]);
                  }
                }
              }
            }
          }
        } else {
          var i = path[path.length - 1] + 1;
          if (i >= curr.supnode.kids.length) {
            path.pop();
            curr = curr.supnode;
            if (path.length == 0) {
              break;
            }
            ifback = true;
          } else {
            ifback = false;
            path[path.length - 1] = i;
            curr = curr.supnode.kids[i];
            supnode = curr.supnode;
            var supflds = supnode.flds;
            var suptblname = supnode.tblname;
            var datasup = oneset[supnode.tblname];
            var currflds = curr.flds;
            var currtblname = curr.tblname;
            var datacurr = oneset[curr.tblname];
            for (var i in datasup) {
              datasup[i].datakids = [];
              for (var j in datacurr) {
                var keymatch = true;
                for (var k in supflds) {
                  if (supflds[k].iskey) {
                    keymatch = keymatch && (datasup[supflds[k].fldname] == datacurr[supflds[k].fldname])
                  }
                }
                if (keymatch) {
                  datasup[i].datakids.push(datacurr[j]);
                }
              }
            }

          }
        }
      }
      resolve(result1);
    })
  }).catch(function (err) {
    reject(err);
  })
};
// module.exports.dataone = function (ot, objkey, ots, otstree, uinfo) { //Todo 2016-10-12 20:31:41, use Promise.each() vs async.waterfall?
//   var root = otstree;
//   var path = [];
//   var ifback = false;
//   var curr = root;
//   var oneobj = getRecords(ot, objkey, ots);
//   var datacurr = oneobj[otstree.tblname];
//   while (true) {
//     if (!ifback) {
//       if (curr.kids && curr.kids.length() > 0) {
//         path.push(0);
//         ifback = false;
//         curr = curr.kids[0];
//         getReords(curr);
//       } else {
//         var i = path[path.length - 1] + 1;
//         if (i >= curr.supnode.kids.length) {
//           path.pop();
//           curr = curr.supnode;
//           ifback = true;
//           if (path.length == 0) {
//             break;
//           }
//         } else {
//           path[path.length - 1] = i;
//           curr = curr.supnode.kids[i];
//           getRecords(curr);
//           ifback = false;
//         }
//       }
//     } else {
//       var i = path[path.length - 1] + 1;
//       if (i >= curr.supnode.kids.length) {
//         path.pop();
//         curr = curr.supnode;
//         if (path.length == 0) {
//           break;
//         }
//         ifback = true;
//       } else {
//         ifback = false;
//         path[path.length - 1] = i;
//         curr = curr.supnode.kids[i];
//         getRecords(curr);
//       }
//     }
//   }
// };

module.exports.otsMarkDepth = function (pOts) { //ordinal, spath, childind
  var sorted = pOts.slice(); // already sorted when fetching from database table by ot and suptblname and tblname
  var compDetail = function (a, b) {
    if (!a.suptblname && !b.suptblname) {
      return 0;
    } else if (!a.suptblname) {
      return -1;
    } else if (!b.suptblname) {
      return 1;
    }
    if (a.suptblname < b.suptblname) {
      return -1;
    } else if (a.suptblname > b.suptblname) {
      return 1;
    } else if (a.tblname < b.tblname) {
      return -1;
    } else if (a.tblname > b.tblname) {
      return 1;
    } else {
      return 0;
    }
  }
  var comp = function (a, b) {
    if (!a.suptblname && !b.suptblname) {
      return 0;
    } else if (!a.suptblname) {
      return -1;
    } else if (!b.suptblname) {
      return 1;
    }
    if (a.suptblname < b.suptblname) {
      return -1;
    } else if (a.suptblname > b.suptblname) {
      return 1;
    } else {
      return 0;
    }
  }
  sorted.sort(compDetail);
  var i = 0;
  var ordi = 0;
  var nextneedles = [];
  var needle;
  var path = [];
  var spath = "";
  var i0;
  if (!sorted[0].suptblname) {
    sorted[0].ordinal = ordi++;
    sorted[0].level = 0;
    sorted[0].childind = 0;
    sorted[0].spath = "0";
    spath = "0.0";
    needle = sorted[0] ? {"ot": sorted[0].ot, "tblname": "", "suptblname": sorted[0].tblname} : null;
    i0 = bs(sorted, needle, comp);
    if (needle) nextneedles.push(needle); // use root as needle
    path.push(0);
    path.push(i0)
    i = i0;
    sorted[i0].childind = 0;
    sorted[i0].spath = "0.0"
  } else if (sorted[0] && !sorted[0].suptblname) {
    console.log("wrong   definition of ots[0] (root). Exiting");
    process.exit();
  }
  var ifback = false;
  while (true) {
    if (!ifback) {
      sorted[i].ordinal = ordi++;
      sorted[i].level = path.length - 1;
      needle = sorted[i] ? {"ot": sorted[i].ot, "tblname": "", "suptblname": sorted[i].tblname} : null;
      i0 = bs(sorted, needle, comp);
      if (i0 > 0) {
        i = i0;
        sorted[i].childind = 0;
        spath = spath + "." + sorted[i].childind.toString();
        sorted[i].spath = spath;
        path.push(i);
        ifback = false;
      } else {
        if (!sorted[i + 1] || sorted[i].suptblname != sorted[i + 1].suptblname) {
          ifback = true;
          path.pop();
          if (path.length == 0) return sorted;
          i = path[path.length - 1];
        } else {
          i = i + 1;
          sorted[i].childind = sorted[i - 1].childind + 1;
          var lastindex = sorted[i - 1].spath.lastIndexOf(".");
          sorted[i].spath = sorted[i - 1].spath.substr(0, lastindex + 1) + sorted[i].childind;
          ifback = false;
          path[path.length - 1] = i;
        }
      }
    } else {
      if (!sorted[i + 1] || sorted[i].suptblname != sorted[i + 1].suptblname) {
        ifback = true;
        path.pop();
        if (path.length == 0) return sorted;
        i = path[path.length - 1];
        spath = sorted[i].spath;
      } else {
        ifback = false;
        i = i + 1;
        sorted[i].childind = sorted[i - 1].childind + 1;
        var lastindex = sorted[i - 1].spath.lastIndexOf(".");
        sorted[i].spath = sorted[i - 1].spath.substr(0, lastindex + 1) + sorted[i].childind;
        console.log(sorted[i].tblname + "/" + sorted[i].spath + " == ifback and no more brother : ");
        path[path.length - 1] = i;
        spath = sorted[i].spath;
      }
    }
  }
  return sorted;
} //Outdated.

module.exports.otsTree = function (pOts) {
  var root;
  var tbls = pOts['tbl']
  for (var i in tbls) {
    var tbl = tbls[i]
    if (!tbl.suptblname) {
      root = tbl;
    }
    var node = tbl;
    node.kids = [];
    for (var j in tbls) {
      if (node.tblname == tbls[j].suptblname) {
        node.kids.push(tbls[j]);
      }
      if (node.suptblname == tbls[j].tblname) {
        node.supnode = tbls[j];
      }
    }
  }
  return root;
} //Direct return

module.exports.bufferOts;

module.exports.authen = function (pU, pTimeKey, pToken) { //pU is yEncoded string. token is sha256 with Timekey salt. //returning u, name, roles
  var u = utils.yDecode(pU);
  var uid = parseInt(u) || -1;
  var timeKey = pTimeKey;
  var token = pToken;
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (err) {
        reject(err);
      } else {
        var sql, para;
        if (uid == -1) {
          sql = "select u, name, password, autolist, cookiedays, locale, dateformat, pagesize, lt from u where name = ?";
          para = [u];
        } else {
          sql = "select u, name, password, autolist, cookiedays, locale, dateformat, pagesize, lt from u where u = ?";
          para = [uid];
        }
        conn.query(sql, para, function (err5, rs) {
          if (err5) {
            reject(err5);
          } else if (rs.length == 0) {
            reject("No user found.");
          } else { // rs.length must be 1.
            if (rs.length > 1) reject("Parameter u: " + u + " leads to multiple uses selected.")
            serverKey = sha256(rs[0].password + timeKey);
            if (serverKey == token) {
              var uinfo = {};
              var role = [];
              var ot = [];
              var rlc = [];
              var org = [];
              conn.query("select u, role from urole where u = ?", [rs[0].u], function (err1, rs1) {
                if (err1) {
                  reject(err1);
                }
                subwhere = " role in (";
                for (var i in rs1) {
                  role.push(rs1[i].role);
                  subwhere = subwhere + " \'" + rs1[i].role + "\', "
                }
                subwhere = subwhere.substr(0, subwhere.length - 2) + ')';
                // ssql = "select role, ot from roleot where " + subwhere;
                // console.log('ssql selecting roleot: ' + ssql);
                conn.query("select role, o.ot, o.name from roleot r inner join ot o on r.ot = o.ot where " + subwhere, function (err2, rs2) {
                  if (err2) {
                    reject(err2)
                    console.log('error when call inner join sql: ' + err2)
                  }
                  for (var i in rs2) {
                    // console.log('roleot record: ' + JSON.stringify(rows2[i]))
                    ot.push({'ot': rs2[i].ot, 'name': rs2[i].name});
                  }
                  conn.query("select role, rlc from rolerlc where " + subwhere, function (err3, rs3) {
                    if (err3) {
                      reject(err3)
                    }
                    for (var i in rs3) {
                      // console.log('rolerlc record: ' + JSON.stringify(rows2[i]))
                      rlc.push(rs3[i].rlc);
                    }
                    conn.query("select role, org from roleorg where " + subwhere, function (err4, rs4) {
                      if (err4) {
                        reject(err4)
                      }
                      for (var i in rs4) {
                        org.push(rs4[i].org)
                      }
                      uinfo["u"] = rs[0].u;
                      uinfo["name"] = rs[0].name;
                      uinfo['autolist'] = rs[0].autolist;
                      uinfo['cookiedays'] = rs[0].cookiedays;
                      uinfo['locale'] = rs[0].locale;
                      uinfo['dateformat'] = rs[0].dateformat;
                      uinfo['pagesize'] = rs[0].pagesize;
                      uinfo['lt'] = rs[0].lt
                      uinfo["role"] = role;
                      uinfo["ot"] = ot;
                      uinfo["rlc"] = rlc;
                      uinfo["org"] = org;
                      resolve(uinfo);
                    })
                  })
                });

                // ssql = "select role, rlc from rolerlc where " + subwhere;
                // console.log('ssql selecting rolerlc: ' + ssql);
              })
            } else {
              reject("wrong password");
            }
          }
        })
      }
    })
  })
} //return promise

module.exports.getUOtSet = function (uinfo, ot, isWaiting, hasRefused, hasPartialReleased, hasFinallyReleased) {
  return new Promise(function (resolve, reject) {
    var found = false;
    for (var i in uinfo.ot) {
      if (ot == uinfo.ot[i]) {
        found = true;
      }
    }
    if (!found) {
      reject("No authorization for object type " + ot);
    }
    getOts(ot).then(function (ots) {
      var otsroot = otsTree(ots);
      var stc = [];
      var instc = " in (";
      for (var i in uinfo.rlc) {
        for (var j in ots.rlc) {
          if (uinfo.rlc[i].ot == ots.rlc[j].ot && uinfo.rlc[i].rlc == ots.rlc[j].rlc) {
            stc.push(ots.rlc[j].fromstc);
            instc = instc + ots.rlc[j].fromstc + ", "
          }
        }
      }
      instc = instc.substr(0, instc.length - 2) + ")";
      var sselect = "select ";
      var result = new Object();
      result.flds = []; //Meta data support? Currently only fld name.
      if (isWating) {
        var sfrom = " from " + otsroot.tblname + " as h ";
        var swhere = " where h.laststc " + instc;
        for (var i in otsroot.flds) {
          if (i == 0) {
            sselect = sselect + "h." + otsroot.flds[i].fldname;
          } else {
            sselect = sselect + ", " + "h." + otsroot.flds[i].fldname;
          }
          result.flds.push(otsroot.flds[i].fldname)
        }
        sselect = sselect + ", h.laststep, h.lastu, h.laststc, h.lastrlc, h.lastrlctime "
      } else if (hasRefused) {
        var sfrom = " from " + otsroot.tblname + " as h ";
        var swhere = " where h.laststc = '-' and h.lastu = " + uinfo.u;
        for (var i in otsroot.flds) {
          if (i == 0) {
            sselect = sselect + "h." + otsroot.flds[i].fldname;
          } else {
            sselect = sselect + ", " + "h." + otsroot.flds[i].fldname;
          }
          result.flds.push(otsroot.flds[i].fldname)
        }
        sselect = sselect + ", h.laststep, h.lastu, h.laststc, h.lastrlc, h.lastrlctime "
      } else if (hasPartialReleased) {
        var sfrom = " from " + otsroot.tblname + " as h ";
        var swhere = " where h.laststc != 'z' and h.laststc != '0' and h.laststc != '-' ";
        var andHis = " and (";
        var sfld = "";
        var keycount = 0;
        for (var i in otsroot.flds) {
          if (i == 0) {
            sselect = sselect + "h." + otsroot.flds[i].fldname;
          } else {
            sselect = sselect + ", " + "h." + otsroot.flds[i].fldname;
          }
          result.flds.push(otsroot.flds[i].fldname);
          if (keycount++ == 0) {
            sfld = sfld + "h." + otsroot.flds[i].fldname;
          } else {
            sfld = sfld + ", h." + otsroot.flds[i].fldname;
          }
        }
        andHis = andHis + "(" + sfld + ") in " + "( select " + sfld + " from y" + otsroot.tblname + " as yh where yh.u = " + uinfo.u + " and yh.step > h.lastzstep )";
        swhere = swhere + andHis;
        sselect = sselect + ", h.laststep, h.lastu, h.laststc, h.lastrlc, h.lastrlctime "
      } else if (hasFinallyReleased) {
        var sfrom = " from " + otsroot.tblname + " as h ";
        var swhere = " where h.laststc == 'z' ";
        var andHis = " and (";
        var sfld = "";
        var keycount = 0;
        for (var i in otsroot.flds) {
          if (i == 0) {
            sselect = sselect + "h." + otsroot.flds[i].fldname;
          } else {
            sselect = sselect + ", " + "h." + otsroot.flds[i].fldname;
          }
          result.flds.push(otsroot.flds[i].fldname);
          if (keycount++ == 0) {
            sfld = sfld + "h." + otsroot.flds[i].fldname;
          } else {
            sfld = sfld + ", h." + otsroot.flds[i].fldname;
          }
        }
        andHis = andHis + "(" + sfld + ") in " + "( select " + sfld + " from y" + otsroot.tblname + " as yh where yh.u = " + uinfo.u + " and yh.step > h.lastzstep )";
        swhere = swhere + andHis;
        sselect = sselect + ", h.laststep, h.lastu, h.laststc, h.lastrlc, h.lastrlctime "
      }
      var sql = sselect + sfrom + swhere;
      result.sql = sql;
      resolve(result);
    }).catch(function (err) {
      reject(err);
    })
  });
}; //return promise

module.exports.getOts = function (pOt, pLocale) {
  return new Promise(function (resolve, reject) {
    if (pLocale === undefined) {
      reject('Please use a locale as parameter. Object type: ' + pOt + '.')
    }
    pool.getConnection(function (err, conn) {
      if (err) {
        reject(err);
      } else {
        conn.query("select ot, tblname, suptblname from ots where ot = ? order by ot, suptblname", [pOt], function (err3, rs3) {
          if (err3) {
            reject(err3);
            console.log("geOts selection erro rwhen selecting ots: " + err3)
          } else {
            var callsql1 = function () {
              return new Promise(function (resolve1, reject1) {
                conn.query("select ot, rlc, fromstc, tostc, cond from otrlc where ot = ?", [pOt], function (err2, rs2) {
                  if (err2) {
                    reject1(err2);
                  } else {
                    var result2 = []
                    for (var i in rs2) {
                      result2.push({
                        "ot": rs2[i].ot,
                        "rlc": rs2[i].rlc,
                        "fromstc": rs2[i].fromstc,
                        "tostc": rs2[i].tostc,
                        "cond": rs2[i].cond
                      });
                    }
                    resolve1(result2);
                  }
                });
              })
            }
            var callsql2 = function () {
              return new Promise(function (resolve2, reject2) {
                conn.query("select ot, o.tblname, o.fldname, iskey, locale, t.txt from otf o inner join txts t on o.txtsid = t.id" +
                  " where ot = ? and locale = ? order by ot, tblname", [pOt, pLocale], function (err1, rs1) {
                  if (err1) {
                    reject2(err1);
                  } else {
                    var result1 = [];
                    for (var i in rs3) {
                      var onetable = {"ot": pOt, "tblname": rs3[i].tblname, "suptblname": rs3[i].suptblname};
                      var flds = [];
                      for (var j in rs1) {
                        if (rs1[j].tblname == rs3[i].tblname) {
                          flds.push({
                            // "ot": pOt,
                            "tblname": rs1[j].tblname,
                            "fldname": rs1[j].fldname,
                            "iskey": rs1[j].iskey,
                            "locale": rs1[j].locale,
                            "txt": rs1[j].txt
                          });
                        }
                      }
                      onetable.flds = flds;
                      result1.push(onetable);
                    }
                    resolve2(result1);
                  }
                })
              });
            }
            Promise.all([callsql1(), callsql2()]).then(function (values) {
              var result = {};
              result["rlc"] = values[0];
              result["tbl"] = values[1];
              resolve(result);
            }).catch(function (err) {
              reject(err);
            });
          }
        })
      }
    })
  });
} // return promise. get object type structure, as well as rlc and org.

module.exports.lockOne = function (uinfo, pOt, ots, otstree, obj) {
  // if (uinfo.ot.indexOf(pOt) > -1 && uinfo.org.indexOf(header.yorg) > -1 && uinfo.rlc.indexOf(header.avaialablerlc) > -1)
  return new Promise(function (resolve, reject) {
    console.log('in biz.lockone......')
    var rtn = 'ot' + pOt + otstree.tblname
    var objkey = []
    var tbldef = yorm.tbldefs[rtn]
    var pcols = tbldef.pricols
    for (var i in pcols) {
      objkey.push(obj[pcols[i]])
    }
    yorm.getone(rtn, objkey).then(function (one) {
      if (one.lockedby > 0) {
        var err = new Error()
        err.name = 'lockedAlready'
        err.message = 'biz.lockOne Locked Already: ' + JSON.stringify(one)
        reject(err);
      } else {
        var oldone = new Object();
        var newone
        Object.assign(oldone, one);
        one.lockedby = uinfo.u;
        one.lockedon = new Date().toISOString().slice(0, 19).replace('T', ' ');
        yorm.saveone(rtn, one).then(function (vnewone) {
          return new Promise(function (resolve1, reject1) {
            newone = vnewone
            yorm.refreshone(rtn, oldone).then(function (vnewnewone) {
              resolve1(vnewnewone)
            })
          })
        }, function (e) {
          console.log('error in biz.lockone: ' + e)
          reject(e)
        }).then(function (newnewone) {
          var deepEqual = true
          for (var i in tbldef.cols) {
            if (newone[tbldef.cols[i]] != newnewone[tbldef.cols[i]]) {
              deepEqual = false
              var err = new Error()
              err.message = JSON.stringify(oldone)
              reject(err)
              return
            }
          }
          if (deepEqual) {
            resolve(newone);
          }
        }, function (e) {
          console.log('error in biz.lockone: ' + e)
          reject(e)
        })
      }
    })
  })
}
module.exports.getRlcs = function (objs, pOt, pUinfo) { //Todo: Not completed.
  return new Promise(function (resolve, reject) {
    var htable, stcs, otstrlcs, uinforlc;
    yorm.query('select tblname from ots where ot = ' + pOt + ' and (subtblname is null or suptblname = "")').then(function (tns) {
      var htable
      for (var i in tns) {
        if (tns[i].tblname.substr(0, 2) != 'ot') {
          htable = 'ot' + pOt + tns[i].tblname
        } else {
          htable = tns[i].tblname
        }
        break
      }
      for (var i in objs) {
        if (objs[i].laststc == undefined || objs[i].laststc == null) {
          objs[i].laststc = '0'
        }
      }
    }).catch(function (e) {
      reject(e)
    })
  })
}
module.exports.getRlc = function (obj, pOt, pUinfo) {
  return new Promise(function (resolve, reject) {
    var htable
    var ntable
    var keyfilter = {}
    var result = []
    yorm.getmany('ots', 'where ot = ' + pOt + ' and (suptblname is null or suptblname = "")').then(function (ots) {
      return new Promise(function (resolve1, reject1) {
        try {
          for (var i in ots) {
            if (ots[i].tblname.substr(0, 2) != 'ot') {
              htable = 'ot' + pOt + ots[i].tblname
            } else {
              htable = ots[i].tblname
            }
            ntable = 'yot' + pOt + 'next'
            break
          }
          var tbldef = yorm.tbldefs[htable]
          for (var i in tbldef.pricols) {
            keyfilter[tbldef.pricols[i]] = obj[tbldef.pricols[i]]
          }
          resolve1()
        } catch (e) {
          console.log('error in biz.getRlc after get ots' + e)
          reject1(e)
        }
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        yorm.getmany(ntable, keyfilter).then(function (nextrlcs) {
          try {
            // console.log('********************biz.getRlc. obj: ' + JSON.stringify((obj)) + ". nextrlcs got: " + JSON.stringify(nextrlcs) + " **************************")
            for (var i in nextrlcs) {
              if (pUinfo.rlc.indexOf(nextrlcs[i].nextrlc) >= 0) {
                result.push(nextrlcs[i])
              }
            }
            resolve(result)
          } catch (e) {
            console.log('error in biz.getRlc: ' + e)
            reject(e)
          }
        })
      }), function (e) {
        console.log('error in biz.getRlc after getmany from ntable' + e)
        reject(e)
      }
    })
  })
}
module.exports.detNextRlc = function (obj, pOt) {
  return new Promise(function (resolve, reject) {
    var laststc = obj.laststc == undefined ? 0 : obj.laststc
    var ots
    var htable
    var ntable
    var keyfilter0 = {}
    var rlcresult = []
    var result = []
    var laststc
    var tbldef
    var nextrlcs
    yorm.getmany('ots', 'where ot = ' + pOt + ' and (suptblname is null or suptblname = "")').then(function (vots) {
      return new Promise(function (resolve1, reject1) {
        ots = vots
        try {
          for (var i in ots) {
            if (ots[i].tblname.substr(0, 2) != 'ot') {
              htable = 'ot' + pOt + ots[i].tblname
            } else {
              htable = ots[i].tblname
            }
            ntable = 'yot' + pOt + 'next'
            break
          }
          laststc = obj.laststc == undefined ? 0 : obj.laststc
          tbldef = yorm.tbldefs[htable]
          for (var i in tbldef.pricols) {
            keyfilter0[tbldef.pricols[i]] = obj[tbldef.pricols[i]]
          }
        } catch (e) {
          reject1(e)
        }
        yorm.getmany('otrlc', {'ot': pOt, 'fromstc': laststc}).then(function (vnextrlcs) {
          nextrlcs = vnextrlcs
          resolve1()
        })
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        Promise.map(nextrlcs, function (nextrlc) {
          return new Promise(function (resolve2, reject2) {
            var sfilter = ' where '
            for (var i in keyfilter0) {
              if (keyfilter0[i] == undefined || keyfilter0[i] == null) {
                sfilter = sfilter + htable + '.' + i + ' is null and '
              }
              // else if (isNaN(keyfilter0[i])) {
              //   sfilter = sfilter + i + ' = "' + keyfilter0[i] + '" and '
              // }
              else {
                sfilter = sfilter + htable + '.' + i + ' = "' + keyfilter0[i] + '" and '
              }
            }

            var zresult = function (pnextrlc) {
              rlcresult.push(nextrlc)
              var nrlc = {}
              for (var i in tbldef.pricols) {
                nrlc[tbldef.pricols[i]] = obj[tbldef.pricols[i]]
              }
              nrlc['nextrlc'] = nextrlc.rlc
              result.push(nrlc)
            }
            if (nextrlc.cond == undefined || nextrlc.cond == null || nextrlc.cond.length < 3) {
              zresult(nextrlc)
              resolve2()
            } else {
              var err = new Error()
              var scond = ' ' + nextrlc.cond.toLowerCase()
              if (scond.indexOf(' select ') >= 0) {
                err.name = 'subquery'
                err.message = 'subquery select not allowed'
                reject2(err)
              } else if (scond.indexOf(' insert ') >= 0) {
                err.name = 'subquery'
                err.message = 'subquery insert not allowed'
                reject2(err)
              } else if (scond.indexOf(' update ') >= 0) {
                err.name = 'subquery'
                err.message = 'subquery update not allowed'
                reject2(err)
              } else if (scond.indexOf(' where ') >= 0) {
                err.name = 'subquery'
                err.message = 'where not necessary for where clause'
                reject2(err)
              } else if (scond.trim().charAt(0) == '(' && scond.trim().charAt(scond.length - 1) == ')') {
                err.name = 'subquery'
                err.message = 'Outer bracket not necessary'
                reject2(err)
              } else {
                var sfrom
                var arrcond = nextrlc.cond.split('====')
                if (arrcond.length == 1) {
                  sfrom = ' from ' + htable
                  sfilter = sfilter + '(' + arrcond[0] + ')'
                } else if (arrcond.length == 2) {
                  if ((' ' + arrcond[1]).indexOf(' group by ') >= 0) {
                    sfilter = sfilter.substr(0, sfilter.length - 4) + arrcond[1]
                  } else {
                    sfilter = sfilter + '(' + arrcond[1] + ')'
                  }
                  sfrom = ' from ' + arrcond[0]
                } else {
                  err.name = 'subquery'
                  err.message = 'Set only from and where clause'
                  reject2(err)
                  return
                }
                var ssql = 'select ' + htable + '.' + yorm.tbldefs[htable].pricols[0] + sfrom + sfilter
                // sfilter = sfilter + ' (' + nextrlc.cond + ')'
                // yorm.getmany(htable, sfilter).then(function (veriobj) {
                yorm.query(ssql).then(function (veriobj) {
                  if (veriobj.length > 0) {
                    zresult(nextrlc)
                    resolve2()
                  } else {
                    resolve2()
                  }
                }, function (e) {
                  reject2(e)
                })
              }
            }
          })
        }).then(function () {
          resolve1()
        })
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        resolve(result)
      })
    }).catch(function (e) {
      console.log('biz.detNextRlc error getmany of htable: ' + e)
      reject(e)
    })
  })
}
module.exports.processone = function (uinfo, pOt, ots, otstree, prlc, objkey, pcomment) {
  return new Promise(function (resolv, reject) {
    var tn = 'ot' + pOt + otstree.tblname;
    var ytn = 'yot' + pOt + otstree.tblname;
    var ntn = 'yot' + pOt + 'next'
    var orlcs, orlcs0 //0 meaning short here
    var prlcone
    var newrlcs
    var lockedone
    var newstatus
    var sdelwhere
    var alldone = false
    var tbldef, pricols
    yorm.getone('otrlc', {'ot': pOt, 'rlc': prlc}).then(function (vrlcone) {
      return new Promise(function (resolv1, reject1) {
        prlcone = vrlcone
        exports.lockOne(uinfo, pOt, ots, otstree, objkey).then(function (vlockedone) {
          lockedone = vlockedone
          if (uinfo.org.indexOf(vlockedone.yorg) < 0) {
            var err = new Error()
            err.name = 'NoAuthorization'
            err.message = 'No Authorization for org: ' + vlockedone.yorg
            reject1(err)
          } else {
            resolv1()
          }
        })
      })
    }).then(function () {
      return new Promise(function (resolv1, reject1) {
        exports.getRlc(objkey, pOt, uinfo).then(function (vvalrlc) {
          orlcs = vvalrlc
          orlcs0 = []
          for (var i in orlcs) {
            orlcs0.push(orlcs[i].nextrlc)
          }
          resolv1()
        })
      })
    }).then(function () {
      return new Promise(function (resolv1, reject1) {
        lockedone.lockedby = null;
        lockedone.lockedon = null;
        if (orlcs0.indexOf(prlc) >= 0) {
          tbldef = yorm.tbldefs[tn]
          newstatus = {};
          Object.assign(newstatus, lockedone);

          var swhereytn
          swhereytn = ' where '
          pricols = tbldef.pricols
          for (var i in pricols) {
            swhereytn = swhereytn + pricols[i] + ' = "' + objkey[pricols[i]] + '" and '
          }
          swhereytn = swhereytn.substr(0, swhereytn.length - 4) + 'order by step desc limit 0, 1';
          yorm.getmany(ytn, swhereytn).then(function (yobjs) {
            var newstep;
            var yyorg;
            if (!yobjs || yobjs.length == 0) {
              newstep = 1;
              yyorg = newstatus.yorg
            } else {
              // console.log('biz.js 915 processone calling getMany. else yobjs: ' + JSON.stringify(yobjs))
              for (var i in yobjs) {
                newstep = yobjs[i]["step"] + 1;
                yyorg = yobjs[i]["yorg"];
                break
              }
            }
            newstatus.step = newstep;
            newstatus.rlc = prlc;
            newstatus.u = uinfo.u;
            newstatus.rlctime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            newstatus.comment = pcomment;
            newstatus.yorg = yyorg;
            newstatus.stc = prlcone.tostc;
            lockedone.laststep = newstep;
            lockedone.lastu = uinfo.u;
            lockedone.laststc = newstatus.stc;
            lockedone.lastrlc = newstatus.rlc;
            lockedone.lastrlctime = newstatus.rlctime
            lockedone.lastchanged = newstatus.rlctime
            resolv1()
          })
        } else {
          alldone = true
          var err = new Error()
          err.name = 'NoAuthorization'
          err.message = 'No Authorization'
          reject1(err)
        }
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        if (alldone) {
          resolve1()
          return
        }
        exports.detNextRlc(lockedone, pOt).then(function (vNewRlcs) {
          newrlcs = vNewRlcs
          sdelwhere = ' where '
          for (var i in pricols) {
            if (isNaN(objkey[pricols[i]])) {
              sdelwhere = sdelwhere + pricols[i] + ' = "' + objkey[pricols[i]] + '" and '
            } else {
              sdelwhere = sdelwhere + pricols[i] + ' = ' + objkey[pricols[i]] + ' and '
            }
          }
          sdelwhere = sdelwhere.substr(0, sdelwhere.length - 4)
          resolve1()
        }).catch(function(e) {
          reject1(e)
        })
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        if (alldone) {
          resolve1()
          return
        }
        yorm.query('delete from ' + ntn + sdelwhere).then(function () {
          resolve1()
        })
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        if (alldone) {
          resolve1()
          return
        }
        if (newrlcs.length > 0) {
          lockedone.rlcs = []
          lockedone.urrlcs = []
          for (var i in newrlcs) {
            lockedone.rlcs.push(newrlcs[i].nextrlc)
            if (uinfo.rlc.indexOf(newrlcs[i].nextrlc) >= 0) {
              lockedone.urrlcs.push(newrlcs[i].nextrlc)
            }
          }
          yorm.savemany(ntn, newrlcs).then(function () {
            resolve1()
          })
        } else {
          // console.log('Final release/reject made or No more release codes for this object: ' + JSON.stringify(lockedone))
          resolve1()
        }
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        if (alldone) {
          resolve1()
          return
        }
        yorm.saveone(ytn, newstatus).then(function () {
          resolve1()
        })
      })
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        if (alldone) {
          resolve1()
          return
        }
        lockedone.lockedby = null
        lockedone.lockedon = null
        yorm.saveone(tn, lockedone).then(function () {
          resolv(lockedone)
        })
      })
    }).catch(function (e) {
      if (e.name.toLowerCase().indexOf('locked') >= 0 && e.name.toLowerCase().indexOf('already') >= 0) {
        console.log('biz.processone:: ' + e.name + ': ' + e.message)
        reject(e)
      } else {
        lockedone.lockedby = null
        lockedone.lockedon = null
        console.log('Rolling back to unlock... because of err: ' + e)
        yorm.saveone(tn, lockedone).then(function () {
          if (e.name.toLowerCase('noauthorization')) {
            reject(e)
          } else {
            var err = new Error()
            err.name = 'ErrorUnknown'
            err.message = 'Error returned but not recognized. Original Error:: ' + e.name + ': ' + e.message
            reject(err)
          }
        })
      }
    })
  })
}


