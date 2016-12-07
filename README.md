# Bureaufast

Bureaufast is an open source workflow engine using Vue.js and Mysql with node.js modules.

If prefer, you can pull the docker by command

sudo docker pull bigdecimap/bureaufast:0.9.3

# Git clone then install by npm is also good.
``` bash
## install dependencies
npm install

## serve with hot reload at localhost:8080
npm run dev
```

Feel free to list your usage here.

Note you can config Mysql DB name/user/password in src/yorm/pool.js. But you have to create the database and user manually.

Then run dbinit.js to populate master data which contains an object type of SAP purchase order and Web Sales order.

By docker, currently environment variable for DB configuration is not ready this verion. But will be supported next one.

There are multiple users in testing DB Mogao/Jingwei/Walker/Songjiang/Saodiseng with different roles/languages. All have the same passwords as user name.
