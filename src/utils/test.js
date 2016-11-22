/**
 * Created by oefish on 10/7/2016.
 */

var Promise = require("bluebird");
var bs = require("binarysearch");
var pool = require("../yorm/pool")

var a = []
console.log(a.indexOf(1))

// var z1 = ['a', 'b'];
// var z1copy = z1.slice();
// z1copy[0] = 'acopy';
// console.log(z1[0]);
// console.log(z1copy[0])
// cosnole.log("early exiting by process.exit()")
// process.exit();
//
// console.log("kk: " + kk);
// var a = function () {
//     return new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             resolve("abc");
//             console.log("abc");
//         }, 1000);
//     })
// };
// var b = function (p) {
//     return new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             if (p) {
//                 resolve("bcd");
//             } else {
//                 reject("something wrong");
//             }
//             console.log("bcd");
//         }, 1000)
//     })
// }
// var c;
// Promise.all([a(), b()]).then(function (values) {
//     c = "cde" + ", values.a: " + values[0] + ", values.b: " + values[1];
//     // c = "cde" + ", a: " + a + ", b: " + b;
//     console.log("c: " + c);
//     // console.log("a:" + a);
//     // console.log("b:" + b);
// }).catch(function (err) {
//     console.log("error:" + err)
// });
// console.log("def");

// var a1;
// setTimeout(function() {
//   a1 = "a1bc";
//   console.log(a1);
// }, 1000)
// var b1;
// setTimeout(function() {
//   b1 =   "b1cd";
//   console.log(b1);
// }, 1000)
// Promise.all([a1, b1]).then(function (){
//   console.log("c1de")
// }).catch(function(err) {
//   console.log("Error: " + err)
// });

// var markLevel = function (pOts) {
//     var sorted = pOts.slice(); // already sorted when fetching from database table by ot and suptblname and tblname
//     var comp = function (a, b) {
//         if (!a.suptblname && !b.suptblname) {
//             return 0;
//         } else if (!a.suptblname) {
//             return -1;
//         } else if (!b.suptblname) {
//             return 1;
//         }
//         if (a.suptblname < b.suptblname) {
//             return -1;
//         } else if (a.suptblname > b.suptblname) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }
//     sorted.sort(comp);
//     var i = 0;
//     var ordi = 0;
//     var nextneedles = [];
//     var needle;
//     if (!sorted[0].suptblname) {
//         sorted[0].ordinal = ordi++;
//         needle = sorted[0] ? {"ot": sorted[0].ot, "tblname": "", "suptblname": sorted[0].tblname} : null;
//         if (needle) nextneedles.push(needle); // use root as needle
//         i++;
//     } else if (sorted[0] && !sorted[0].suptblname) {
//         console.log("wrong   definition of ots[0] (root). Exiting");
//         process.exit();
//     }
//     while (true) {
//         var needles = nextneedles;
//         nextneedles = [];
//         for (var i0 in needles) {
//             var i1 = bs(sorted, needles[i0], comp);
//             i2 = i1;
//             while (sorted[i2] && sorted[i2].suptblname == needles[i0].suptblname) {
//                 needle = sorted[i2] ? {"ot": sorted[i2].ot, "tblname": "", "suptblname": sorted[i2].tblname} : null;
//                 if (needle) nextneedles.push(needle);
//                 sorted[i2++].ordinal = ordi++;
//             }
//         }
//         if (!needles || needles.length == 0) {
//             break;
//         }
//     }
//     return sorted;
// }
// var markDepth = function (pOts) {
//     var sorted = pOts.slice(); // already sorted when fetching from database table by ot and suptblname and tblname
//     var compDetail = function (a, b) {
//         if (!a.suptblname && !b.suptblname) {
//             return 0;
//         } else if (!a.suptblname) {
//             return -1;
//         } else if (!b.suptblname) {
//             return 1;
//         }
//         if (a.suptblname < b.suptblname) {
//             return -1;
//         } else if (a.suptblname > b.suptblname) {
//             return 1;
//         } else if (a.tblname < b.tblname) {
//             return -1;
//         } else if (a.tblname > b.tblname) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }
//     var comp = function (a, b) {
//         if (!a.suptblname && !b.suptblname) {
//             return 0;
//         } else if (!a.suptblname) {
//             return -1;
//         } else if (!b.suptblname) {
//             return 1;
//         }
//         if (a.suptblname < b.suptblname) {
//             return -1;
//         } else if (a.suptblname > b.suptblname) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }
//     sorted.sort(compDetail);
//     var i = 0;
//     var ordi = 0;
//     var nextneedles = [];
//     var needle;
//     var path = [];
//     var spath = "";
//     var i0;
//     if (!sorted[0].suptblname) {
//         sorted[0].ordinal = ordi++;
//         sorted[0].level = 0;
//         sorted[0].childind = 0;
//         sorted[0].spath = "0";
//         spath = "0.0";
//         needle = sorted[0] ? {"ot": sorted[0].ot, "tblname": "", "suptblname": sorted[0].tblname} : null;
//         i0 = bs(sorted, needle, comp);
//         if (needle) nextneedles.push(needle); // use root as needle
//         path.push(0);
//         path.push(i0)
//         i = i0;
//         sorted[i0].childind = 0;
//         sorted[i0].spath = "0.0"
//     } else if (sorted[0] && !sorted[0].suptblname) {
//         console.log("wrong   definition of ots[0] (root). Exiting");
//         process.exit();
//     }
//     var ifback = false;
//     while (true) {
//         if (!ifback) {
//             sorted[i].ordinal = ordi++;
//             sorted[i].level = path.length - 1;
//             needle = sorted[i] ? {"ot": sorted[i].ot, "tblname": "", "suptblname": sorted[i].tblname} : null;
//             i0 = bs(sorted, needle, comp);
//             if (i0 > 0) {
//                 i = i0;
//                 sorted[i].childind = 0;
//                 spath = spath + "." + sorted[i].childind.toString();
//                 sorted[i].spath = spath;
//                 path.push(i);
//                 ifback = false;
//             } else {
//                 if (!sorted[i + 1] || sorted[i].suptblname != sorted[i + 1].suptblname) {
//                     ifback = true;
//                     path.pop();
//                     if (path.length == 0) return sorted;
//                     i = path[path.length - 1];
//                 } else {
//                     i = i + 1;
//                     sorted[i].childind = sorted[i - 1].childind + 1;
//                     var lastindex = sorted[i - 1].spath.lastIndexOf(".");
//                     sorted[i].spath = sorted[i - 1].spath.substr(0, lastindex + 1) + sorted[i].childind;
//                     ifback = false;
//                     path[path.length - 1] = i;
//                 }
//             }
//         } else {
//             if (!sorted[i + 1] || sorted[i].suptblname != sorted[i + 1].suptblname) {
//                 ifback = true;
//                 path.pop();
//                 if (path.length == 0) return sorted;
//                 i = path[path.length - 1];
//                 spath = sorted[i].spath;
//             } else {
//                 ifback = false;
//                 i = i + 1;
//                 sorted[i].childind = sorted[i - 1].childind + 1;
//                 var lastindex = sorted[i - 1].spath.lastIndexOf(".");
//                 sorted[i].spath = sorted[i - 1].spath.substr(0, lastindex + 1) +sorted[i].childind;
//                 console.log(sorted[i].tblname + "/" + sorted[i].spath + " == ifblack and no more brother : ");
//                 path[path.length - 1] = i;
//                 spath = sorted[i].spath;
//             }
//         }
//     }
//     return sorted;
// }
// ots = [];
// ots.push({"ot": 1, "tblname": "ekko", "suptblname": null});
// ots.push({"ot": 1, "tblname": "ekpo", "suptblname": "ekko"});
// ots.push({"ot": 1, "tblname": "ekpo1", "suptblname": "ekpo"});
// ots.push({"ot": 1, "tblname": "ekpo2", "suptblname": "ekpo"});
// ots.push({"ot": 1, "tblname": "ekpo11", "suptblname": "ekpo1"});
// ots.push({"ot": 1, "tblname": "ekpo3", "suptblname": "ekpo"});
// ots.push({"ot": 1, "tblname": "ekzo", "suptblname": "ekko"});
// ots.push({"ot": 1, "tblname": "ekzo1", "suptblname": "ekzo"});
// var t = Date.now();
// var m = markDepth(ots);
// for (var ot in m) {
//     console.log("ot" + ot + ": " + m[ot].ot + ", " + m[ot].tblname + "," + m[ot].suptblname + ", " + m[ot].ordinal + ", " + m[ot].level + ", " + m[ot].spath);
// }
// console.log("Time start: " + t);
// console.log("Time end: " + Date.now());
// console.log("Time consumpted: " + (Date.now() - t).toString());
//
// var applocals = require("./appLocals");
// var applocal;
// // console.log(applocals.aaa());
// applocals.getOts(applocal).then(function(values) {
//     console.log(values);
// }).catch(function(err) {
//     console.log(err);
// })
