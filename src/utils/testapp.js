/**
 * Created by oefish on 10/8/2016.
 */
var Promise = require("bluebird");
var express = require("express");
var pool = require("./pool")

var app = express();
app.locals= {
    local1 : "local1",
    local2 : "local2"
};
new Promise(function (resolve, reject) {
    result = 0;
    pool.getConnection(function (err, conn) {
        conn.query("select ot, name from ot", [], function (err, rows) {
            if (err) {
                reject(err);
            }
            for (row in rows) {
                result = result + 1;
                console.log("writeing rows in ot: " + rows[row].ot + " ,  " + rows[row].name);
                console.log("abc value is: " + result.toString());
                app.locals["local1"] = rows[row].name;
            }
            resolve(result)
        })
    })
}).then(function (values) {
    app.get("/", function (req, res, next) {
        res.status(200).json({"app.locals['local1']": app.locals.local1});
    })

    var port = 8000;
    app.listen(port, function (err) {
        if (err) {
            console.log("something wrong" + err);
            return;
        }
        console.log("listening at :" + port);
    })
}).catch(function (err) {
    console.log(err)
});



