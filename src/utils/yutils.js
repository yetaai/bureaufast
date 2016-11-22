/**
 * Created by oefish on 9/22/2016.
 */
// import VueCookie from 'vue-cookie';
var VueCookie = require('vue-cookie');
var bs = require('binarysearch');
var btoa = require('btoa')
var atob = require('atob')

exports.getTimekey = function (tstamp, seedno) {
  if (!tstamp) {
    tstamp = Date.now();
  }
  if (!seedno) {
    seedno = 0;
  }
  return Math.floor(tstamp / (1000 * 300) - 1).toString()
  // return (tstamp / (1000 * 300) - 1).toString()
}

var setToken = function (user, pass, tstamp, exdays) {
  timeKey = this.getTimekey(tstamp, 0);
  rawToken = user + '/' + pass;
  hashedToken = bCrypt.hashSync(rawToken, timeKey);
  this.setCookie(this.tokenCookie, hashedToken, exdays)
  this.setCookie(this.lastLoginCookie, timeKey, exdays)
}
exports.lastLoginCookie = 'jk3l9fsaj5dklf';
exports.tokenCookie = 'kfdgf36ilH';
exports.setCookie = function (cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + '; ' + expires;
}

exports.getCookie = function (cname) {
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

exports.checkCookie = function () {
  var user = getCookie('username');
  if (user != '') {
    alert('Welcome again ' + user);
  } else {
    user = prompt('Please enter your name:', '');
    if (user != '' && user != null) {
      setCookie('username', user, 365);
    }
  }
}

module.exports.yEncode = function (pS0) {
  if (!(typeof pS0 === 'string' || pS0 instanceof String)) {
    console.log('non-string yEncode parameter value:' + JSON.stringify(pS0))
    console.log('yEncode: please use string parameter.')
    return false;
  } else if (pS0 && pS0.length == 0) {
    return false
  }
  var result = '';
  for (var i = 0; i < pS0.length; i++) {
    result = result + String.fromCharCode((pS0.charCodeAt(i) + 1) % 65536)
  }
  return btoa(result);
}
module.exports.yDecode = function (pS0) {
  if (!(typeof pS0 === 'string' || pS0 instanceof String)) {
    console.log('non-string yDecode parameter value:' + JSON.stringify(pS0))
    console.log('yEncode: please use string parameter.')
    return false;
  } else if (pS0 && pS0.length == 0) {
    return false
  }
  var ps1 = atob(pS0);
  var result = '';
  for (var i = 0; i < ps1.length; i++) {
    result = result + String.fromCharCode((ps1.charCodeAt(i) - 1) % 65536)
  }
  return result;
}

module.exports.isset = function (p0) {
  if (typeof p0 === 'undefined' || p0 === null || p0 === false) {
    return false;
  } else {
    return true;
  }
}
module.exports.issetnonspace = function (p0) {
  if (typeof p0 === 'undefined' || p0 === null || p0 === false || (typeof p0.toLowerCase() === 'string' && p0.trim() === '')) {
    return false;
  } else {
    return true;
  }
}

module.exports.markLevel = function (pOts) {
  var sorted = pOts.slice(); // already sorted when fetching from database table by ot and suptblname and tblname
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
  sorted.sort(comp);
  var i = 0;
  var ordi = 0;
  var nextneedles = [];
  var needle;
  if (!sorted[0].suptblname) {
    sorted[0].ordinal = ordi++;
    needle = sorted[0] ? {'ot': sorted[0].ot, 'tblname': '', 'suptblname': sorted[0].tblname} : null;
    if (needle) nextneedles.push(needle); // use root as needle
    i++;
  } else if (sorted[0] && !sorted[0].suptblname) {
    console.log('wrong   definition of ots[0] (root). Exiting');
    process.exit();
  }
  while (true) {
    var needles = nextneedles;
    nextneedles = [];
    for (var i0 in needles) {
      var i1 = bs(sorted, needles[i0], comp);
      i2 = i1;
      while (sorted[i2] && sorted[i2].suptblname == needles[i0].suptblname) {
        needle = sorted[i2] ? {'ot': sorted[i2].ot, 'tblname': '', 'suptblname': sorted[i2].tblname} : null;
        if (needle) nextneedles.push(needle);
        sorted[i2++].ordinal = ordi++;
      }
    }
    if (!needles || needles.length == 0) {
      break;
    }
  }
  return sorted;
}
module.exports.otsMarkDepth = function (pOts) {
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
  if (!sorted[0].suptblname) {
    sorted[0].ordinal = ordi++;
    needle = sorted[0] ? {'ot': sorted[0].ot, 'tblname': '', 'suptblname': sorted[0].tblname} : null;
    if (needle) nextneedles.push(needle); // use root as needle
    path.push(0);
    path.push(1)
    i++;
  } else if (sorted[0] && !sorted[0].suptblname) {
    console.log('wrong   definition of ots[0] (root). Exiting');
    process.exit();
  }
  var ifback = false;
  var i0;
  while (true) {
    if (!ifback) {
      sorted[i].ordinal = ordi++;
      needle = sorted[i] ? {'ot': sorted[i].ot, 'tblname': '', 'suptblname': sorted[i].tblname} : null;
      i0 = bs(sorted, needle, comp);
      if (i0 > 0) {
        i = i0;
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
          ifback = false;
          path[path.length - 1] = i;
        }
      }
    } else {
      // i = i + 1;
      if (!sorted[i + 1] || sorted[i].suptblname != sorted[i + 1].suptblname) {
        ifback = true;
        path.pop();
        if (path.length == 0) return sorted;
        i = path[path.length - 1];
      } else {
        ifback = false;
        i = i + 1;
        path[path.length - 1] = i;
      }
    }
  }
}
