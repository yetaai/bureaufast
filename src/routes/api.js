var express = require('express')
var router = express.Router();
var pool = require('../yorm/pool');
var yutils = require('../utils/yutils');
var sha256 = require('sha256');
var Promise = require('bluebird');
var biz = require("../utils/biz")
var bodyParser = require('body-parser')
var safe = require('../assets/secret')
var yorm = require('../yorm/yorm')

var jsonParser = bodyParser.json()
Promise.config({
  longStackTraces: true,
  warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
})

router.get('/abc', function (req, res, next) {
  res.status(200).json(req.url);
})
router.post('/inputhelp', jsonParser, function (req, res, next) {
  var reqcol = req.body.reqcol
  var reqmaxitems = req.body.maxitems
  var uinfo = req.body.uinfo

  var result = {}

  var ssql0 = 'select ssql from ih i inner join ihlink l on i.ih = l.ih where l.tn = "' + reqcol.tblname +
    '" and l.fn = "' + reqcol.fldname + '" and opt = 0 '
  pool.getConnection(function (err, conn) {
    if (err) {
      res.status(401).json('App server failed to connect database. ' + err)
    } else {
      conn.query(ssql0, [], function (err1, rs) {
        if (err1) {
          res.status(401).json('App server failed to get inputhelp setting. ' + err1)
        } else if (rs.length == 0) {
          res.status(210).json('Please config input help for ' + reqcol.tblname + '/' + reqcol.fldname)
        } else {
          var ssql1
          for (var i in rs) {
            //Currently only 1 inputhelp (opt 0) is supported but in future, all input help could be returned. Both response anc client side need to be changed.
            ssql1 = rs[i].ssql + ' limit 0, ' + reqmaxitems
            break
          }
          conn.query(ssql1, [], function (err2, rs1, fields) {
            if (err2) {
              console.log('error sql: ' + ssql1)
              res.status(403).json('App server inputhelp setting is correct? ' + err2)
            } else {
              conn.query('select id, txt from txts where id in (?, ?) and locale = ?', [safe.txtmaxitems, safe.txtfilter, uinfo.locale], function (err3, rs2) {
                if (err3) {
                  res.status(403).json('Text of either maxitems or search cannot be found due to sql/db error. ' + err3)
                } else {
                  var j = 0
                  for (var i in rs2) {
                    if (rs2[i].id === safe.txtmaxitems) {
                      result[safe.txtmaxitems.toString()] = rs2[i].txt
                      j++
                    } else {
                      result[safe.txtfilter.toString()] = rs2[i].txt
                      j++
                    }
                  }
                  var ssql2 = 'select txt, tblname, fldname from txts '
                  var swhere2 = 'where ('
                  for (var i in fields) {
                    var sonewhere = '(tblname = "' + fields[i].orgTable + '" and fldname = "' + fields[i].orgName + '")'
                    swhere2 = swhere2 + sonewhere + ' or '
                  }
                  ssql2 = ssql2 + swhere2.substr(0, swhere2.length - 4) + ') and locale = "' + uinfo.locale + '"'
                  // console.log('select field name txt: ' + ssql2)
                  conn.query(ssql2, [], function (err4, rs3) {
                    console.log(JSON.stringify(rs3))
                    if (err4) {
                      res.status(403).json('Failed to select txts for opt cols and names.')
                    } else if (j === 2) {
                      result.optcols = fields
                      result.items = rs1
                      result.optcolstxt = rs3
                      res.status(200).json(result)
                    } else {
                      result[safe.txtmaxitems.toString()] = 'Max items'
                      result[safe.txtfilter.toString()] = 'Filter'
                      result.optcols = fields
                      result.optcolstxt = rs3
                      result.items = rs1
                      res.status(200).json(result)
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
})
router.post('/locale/update/:u/:locale', jsonParser, function (req, res) {
  var modelu = {}
  modelu.u = req.params.u
  modelu.locale = req.params.locale
  yorm.saveone('u', modelu).then(function (val) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.status(200).json('Success to udpate locale')
  }).catch(function (err) {
    res.status(403).json('faield to update locale for ' + modelu)
  })
})
router.post('/u/upd', jsonParser, function (req, res) {
  var u = {}
  u.u = req.body.uinfo.u
  yorm.getone('u', {'u': u.u}).then(function (vu) {
    return new Promise(function (resolve, reject) {
      vu.locale = req.body.uinfo.locale == undefined ? vu.locale : req.body.uinfo.locale
      vu.pagesize = req.body.uinfo.pagesize == undefined ? vu.pagesize : req.body.uinfo.pagesize
      vu.autolist = req.body.uinfo.autolist == undefined ? vu.autolist : req.body.uinfo.autolist
      vu.cookiedays = req.body.uinfo.cookiedays == undefined ? vu.cookiedays : req.body.uinfo.cookiedays
      vu.lt = req.body.uinfo.lt == undefined ? vu.lt : req.body.uinfo.lt
      vu.dateformat = req.body.uinfo.dateformat == undefined ? vu.dateformat : req.body.uinfo.dateformat
      resolve(vu)
    })
  }).then(function (vu) {
    yorm.saveone('u', vu).then(function (vvu) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.status(200).json('Success to udpate locale')
    }).catch(function (err) {
      console.log('=============error of /u/upd saveone' + err)
      res.status(403).json('Failed to update lcoale for :' + u)
    })
  })
})
router.post('/otfs', jsonParser, function (req, res, next) {
  var ots = []
  for (var i in req.body.ot) {
    ots.push(req.body.ot[i])
  }
  var locale = req.body.locale
  var ot
  var promises = [];
  for (var i in ots) {
    ot = ots[i];
    promises.push(function (pOt, pLocale) {
      return new Promise(function (resolve, reject) {
        biz.getOts(pOt, pLocale).then(function (valOts) {
          var oneresult = {};
          oneresult['ot'] = pOt;
          oneresult['value'] = valOts;
          resolve(oneresult)
        }).catch(function (err) {
          reject(err)
        })
      })
    }(ot, locale))
  }
  Promise.all(promises).then(function (values) {
    var result = {}
    for (var i in values) {
      result[values[i].ot.toString()] = values[i].value
    }
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.status(200).json(result)
  })
})
router.post('/userLogin', jsonParser, function (req, res, next) {
  // console.log('req.body username: ' + req.body['username'])
  // console.log('req.body usertoken: ' + req.body['usertoken'])
  // console.log('req.body.agent: ' + req.body.agent)
  // console.log('req.body.timekey: ' + req.body.timekey)
  //
  // res.status(200).json('success')
  var clientToken = req.body[safe.token]; //Had been hash twice and second time with timeKey as salt.
  var u = req.body[safe.u]
  var username = req.body[safe.user];
  var agent = req.body[safe.agent];
  var timekey = req.body[safe.timekey];
  // console.log('u is: ' + u)
  // console.log('username is: ' + yutils.yDecode(username))
  // console.log('agent is: ' + yutils.yDecode(agent))
  // console.log('timekey is: ' + timekey)
  // console.log('clienttoken is: ' + clientToken)
  var pu
  if (!yutils.isset(u) || u === 'undefined') {
    pu = username
  } else {
    pu = u
  }
  biz.authen(pu, timekey, clientToken).then(function (value) {
    res.status(200).json(value);
  }).catch(function (err) {
    console.log('rejected by authentication')
    res.status(210).json(err);
  })
});
router.post('/getobjs', jsonParser, function (req, res, next) {
  var uinfo = req.body.uinfo
  var result = {}
  var promises = []
  for (var key in req.body.ots) {
    promises = []
    var ot = key
    var sot = ot.toString()
    result[sot] = {}
    var otfs = req.body.ots[key].otfs
    var superflds = req.body.ots[key].superflds
    var pagesize = uinfo.pagesize
    var page = req.body.ots[key].page
    // var totalpages0 = req.body.ots[key].totalpages
    // var totalpages1 = 0
    var sortflds = req.body.ots[key].sortflds

    var sselect = 'select '
    var sfrom = ' from '
    var swhere = ' where '
    var ssort
    // console.log('api.getobjs() sortflds: ' + JSON.stringify(sortflds))
    if (sortflds === undefined || sortflds === null || sortflds.length === 0) {
      ssort = ''
    } else if (sortflds.length === 1 && sortflds[0].fldname == 'urrlcs') {
      ssort = ''
    } else {
      ssort = ' order by '
      for (var i in sortflds) {
        if (sortflds[i].fldname == 'urrlcs') {
          continue
        }
        ssort = ssort + sortflds[i].fldname + ' ' + sortflds[i].sortdir + ', '
      }
      ssort = ssort.substr(0, ssort.length - 2)
    }
    var htable;
    for (var i in superflds) {
      if (!yutils.issetnonspace(superflds[i].suptblname)) {
        htable = 'ot' + ot + superflds[i].tblname
        break;
      }
    }
    sfrom = sfrom + htable
    for (var i in otfs) {
      var onefld = otfs[i]
      var onewhere = ''
      if (onefld.lowval != undefined && onefld.lowval.length > 0) {
        if (onefld.highval != undefined && onefld.highval.length > 0) {
          if (onefld.lowoption == 'nn' && onefld.highoption == 'nn') {
            onewhere = 'a.' + onefld.fldname + ' >= "' + onefld.lowval + '" and ' + 'a.' + onefld.fldname + ' <= "' + onefld.highval + '"'
            swhere = swhere + onewhere + ' and '
            continue
          }
        }
        if (onefld.lowoption == 'nn') {
          if (onefld.highoption != 'nn' && onefld.highval != undefined && onefld.highval.length > 0) {
            onewhere = 'a.' + onefld.fldname + ' >= "' + onefld.lowval + '"'
          } else {
            onewhere = 'a.' + onefld.fldname + ' = "' + onefld.lowval + '"'
          }
        } else {
          onewhere = 'a.' + onefld.fldname + ' ' + onefld.lowoption + ' "' + onefld.lowval + '"'
        }
        if (onefld.highoption != 'nn') {
          onewhere = onewhere + ' and ' + 'a.' + onefld.fldname + ' ' + onefld.highoption + ' "' + onefld.highval
        }
        swhere = swhere + onewhere + ' and '
      }
    }
    for (var i in superflds) {
      onefld = superflds[i]
      if (onefld.fldname == 'rlcs' || onefld.fldname == 'urrlcs') {
        continue
      }
      sselect = sselect + 'a.' + onefld.fldname + ', '
    }
    if (swhere.length > 8) {
      swhere = swhere.substr(0, swhere.length - 4)
    } else {
      swhere = ''
    }
    // sselect = sselect.substr(0, sselect.length - 2)
    var ntable = 'yot' + ot + 'next'
    sselect = sselect + 'a.yorg, group_concat(b.nextrlc) as rlcs '
    sfrom = sfrom + ' a left outer join ' + ntable + ' b'
    var son = ' on'
    var sgroup = ' group by'
    var apricol
    var tbldef = yorm.tbldefs[htable]
    for (var i in tbldef.pricols) {
      apricol = tbldef.pricols[i]
      son = son + ' a.' + apricol + ' = b.' + apricol + ' and'
      sgroup = sgroup + ' a.' + apricol + ', '
    }
    son = son.substr(0, son.length - 3)
    sgroup = sgroup.substr(0, sgroup.length - 2)
    sfrom = sfrom + son

    swhere = swhere + sgroup
    var ssqlcnt = 'select count(*) as cnt from (select count(*) as gcnt ' + sfrom + swhere + ') a'
    var p0 = function (pssqlcnt, pot) {
      return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
          if (err) {
            console.log('api.getobjs get connection error: ' + err)
            reject(err)
          } else {
            conn.query(ssqlcnt, [], function (err1, rs) {
              if (err1) {
                console.log('api.getobjs in query db: ' + err1)
                reject(err1)
              } else {
                for (var i in rs) {
                  result[pot.toString()].reccnts = rs[i].cnt
                  result[pot.toString()].totalpages = Math.floor(rs[i].cnt / uinfo.pagesize) + 1
                  if (page > result[sot.totalpages]) {
                    result[sot].page = result[sot].totalpages
                  } else {
                    result[sot].page = page
                  }
                  break
                }
                resolve()
              }
            })
          }
        })
      })
    }
    p0(ssqlcnt, ot).then(function() {
      var slimit
      if (uinfo.lt == safe.txttaskall) { //List type
        slimit = ' limit ' + (result[sot].page * pagesize - pagesize).toString() + ', ' + pagesize.toString()
      } else {
        slimit = ''
      }
      var ssql = sselect + sfrom + swhere + ssort + slimit
      return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
          if (err) {
            reject(err)
          } else {
            conn.query(ssql, [], function (err1, rs) {
              if (err1) {
                console.log('api.getobjs query error: ' + err1)
                reject(err1)
              } else {
                // console.log('api.getobjs query resultset: ' + JSON.stringify(rs))
                if (rs.length === 0) {
                  resolve()
                } else {
                  result[sot].objs = rs
                  result[sot].otfs = superflds

                  Promise.map(rs, function (obj) {
                    return new Promise(function (resolve1, reject1) {
                      try {
                        obj.urrlcs = []
                        if (obj.rlcs == undefined || obj.rlcs.length == 0) {
                          obj.rlcs = []
                        } else {
                          var objrlcs = obj.rlcs.split(',')
                          obj.rlcs = objrlcs
                          objrlcs.forEach(function (objrlc) {
                            if (uinfo.rlc.indexOf(objrlc.trim()) >= 0) {
                              obj.urrlcs.push(objrlc)
                            }
                          })
                        }
                        resolve1()
                      } catch (e) {
                        reject1(e)
                      }
                    })
                  }).then(function () {
                    resolve()
                  }).catch(function (e) {
                    console.log(e)
                    reject(e)
                  })
                }
              }
            })
          }
        })
      })
    }).then(function(value) {
      var item
      var zresult
      if (uinfo.lt == safe.txttaskall) { // all
        // result[sot].totalpages = Math.floor(result[sot].objs.length / uinfo.pagesize) + 1
        res.status(200).json(result)
      } else {
        if (uinfo.lt == safe.txttaskrel) {
          zresult = []
          for (var i in result[sot].objs) {
            item = result[sot].objs[i]
            if (uinfo.org.indexOf(item.yorg) >= 0) {
              zresult.push(item)
            }
          }
          result[sot].totalpages = Math.floor(zresult.length / uinfo.pagesize) + 1
          if (page > result[sot.totalpages]) {
            result[sot].page = result[sot].totalpages
          } else {
            result[sot].page = page
          }
          result[sot].objs = zresult.splice(result[sot].page * uinfo.pagesize - uinfo.pagesize, result[sot].page * uinfo.pagesize)
        } else if (uinfo.lt == safe.txttaskonly) {
          zresult = []
          // console.log('+++++++++++++++++++++++++++++++++++result[sot].objs: ' + JSON.stringify(result[sot].objs))
          var lk = 0
          for (var i in result[sot].objs) {
            item = result[sot].objs[i]
            if (item.urrlcs != undefined && item.urrlcs.length > 0 && uinfo.org.indexOf(item.yorg) >= 0) {
              zresult.push(item)
            }
          }
          result[sot].totalpages = Math.floor(zresult.length / uinfo.pagesize) + 1
          if (page > result[sot.totalpages]) {
            result[sot].page = result[sot].totalpages
          } else {
            result[sot].page = page
          }
          result[sot].objs = zresult.splice(result[sot].page * uinfo.pagesize - uinfo.pagesize, result[sot].page * uinfo.pagesize)
        }
        res.status(200).json(result)
      }
    }).catch(function (err) {
      res.status(403).json(err)
    })
  }
})
router.post('/hisLogin', function (req, res, next) {
  var newToken;
  var u = req.body.user.u;
  var newTimeKey;
  var clientToken = req.body.user.token; //Had been hash twice and second time with timeKey as salt.
  var timeKey = req.body.user.timeKey;
  var useragent = req.body.useragent;
  biz.authen(u, timeKey, clientToken).then(function (value) {
    res.status(200).json(value);
  }).catch(function (err) {
    res.status(210).json(err);
  })
})

router.post('/admin/objecttype/list', function (reg, res, next) {
  var u = req.body.user.u;
  var clientToken = req.body.user.token;
  var timeKey = req.body.user.timeKey;
  biz.authen(u, timeKey, clientToken).then(function (value) {
    var hasAdmin = false;
    for (var i in u.roles) {
      if (u.roles[i].toLowerCase() == 'admin') {
        hasadmin = true;
        break;
      }
    }
    if (hasAdmin) {
      pool.getConnection(function (err, conn) {
        var result = [];
        if (err) {
          res.status(402).json(err);
        } else {
          conn.query('select ot, name from ot', [], function (err, rows) {
            if (err) {
              res.status(402).json(err);
            } else {
              for (var i in rows) {
                result.push({'ot': rows[i].ot, 'name': rows[i].name})
              }
              res.status(200).json(result);
            }
          })
        }
      })
    }
  }).catch(function (err1) {
    console.log(err1);
  });
});
router.post('/admin/objecttype/update', function (req, res, next) {
});

router.get('/admin/roles/config', function (req, res, next) {
});

router.post('/admin/roles/assign', function (req, res, next) {
});

router.post('/roles/list/', function (req, res, next) {
  var u = req.body.user.u;
  var clientToken = req.body.user.token;
  var timeKey = req.body.user.timeKey;
  biz.authen(u, timeKey, clientToken).then(function (uinfo) {
    res.status(200).json(uinfo.roles);
  }).catch(function (err) {
    res.status(401).json(err);
  })
})

router.post('/report/ot/:ot', function (req, res, next) { //req.params.ot
  var u = req.body.user.u;
  var clientToken = req.body.user.token;
  var timeKey = req.body.user.timeKey;
  var waiting = req.body.waiting;
  var refused = req.body.refused;
  var partialReleased = req.body.partialReleased;
  var finallyReleased = req.body.finallyReleased;
  biz.authen(u, timeKey, clientToken).then(function (vuinfo) {
    var ot = req.params.ot;
    biz.getUOtSet(vuinfo, ot, waiting, refused, partialReleased, finallyReleased).then(function (values) {
      res.status(200).json(values);
    })
  }).catch(function (err) {
    res.status(402).json(err);
  })
});

router.post('/display/ot', function (req, res, next) {
  var u = req.body.user.u;
  var clientToken = req.body.user.token;
  var timeKey = req.body.user.timeKey;
  var ot = req.body.ot;
  var objkey = req.body.objkey;

  biz.authen(u, timeKey, clientToken).then(function (uinfo) {
    biz.getOts(ot).then(function (ots) {
      otstree = biz.otsTree(ots);
      biz.dataone(ot, objkey, ots, otstree, uinfo).then(function (values) {
        res.status(200).json(values);
      })
    }).catch(function (err) {
      res.status(401).json(err);
    })
  })
})
router.post('/process', jsonParser, function (req, res, next) {
  var clientToken = req.body[safe.token]; //Had been hash twice and second time with timeKey as salt.
  var u = req.body[safe.u]
  var user = req.body[safe.user];
  var agent = req.body[safe.agent];
  var timekey = req.body[safe.timekey];

  var comment = req.body[comment]

  var ot = req.body.ot;
  var obj = req.body.obj;
  var rlc = req.body.rlc;
  biz.authen(user, timekey, clientToken).then(function (uinfo) {
    biz.getOts(ot, uinfo.locale).then(function (ots) {
      var otstree = biz.otsTree(ots)
      biz.processone(uinfo, ot, ots, otstree, rlc, obj, comment)
        .then(function (value) {
          result = value
          res.status(200).json(result)
        }).catch(function (err) {
        res.status(401).json(err)
      })
    })
  })
});
module.exports = router;
//Client/server sent timeKey: Always encoded.
