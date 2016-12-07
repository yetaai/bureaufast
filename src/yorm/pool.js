/**
 * Created by oefish on 11/15/16.
 */
var Promise = require('bluebird')
var mysql = require('mysql')
var lschema = 'test'
var myconfig = {
  connectionLimit: 200,
  host: '127.0.0.1',
  port: 3306,
  user: 'tt',
  password: 'elttil',
  database: lschema,
  debug: false
};

var pool
pool = mysql.createPool(myconfig)
pool.myconfig = myconfig
pool.buflist = []
pool.batchsize = 20
pool.database = lschema

module.exports = pool
