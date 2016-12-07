/* leng is for length of the characters, decimals is for number of decimal places. */
drop table if exists dd03l;
create table if not exists dd03l(tblname varchar(30), fldname varchar(30), position char(4), as4local char(1), as4vers char(4),
     keyflag char(1), checktable varchar(30), datatype char(4), leng int, decimals int,
     primary key(tblname, fldname, position, as4local, as4vers));
insert into dd03l values ('ekko', 'ebeln', '', '', '',        'Y', '', 'char', 10, null),
                           ('ekko', 'lifnr', '', '', '',        'N', '', 'char', 10, null),
                          ('ekko', 'netwr', '', 'N', '',       'N', '', 'curr', 18, 2),
                          ('ekko', 'zterm', '', '', '',       'N', '', 'char', 4, null),
                          ('ekko', 'ekorg', '', '', '',       'N', '', 'char', 4, null),
                          ('ekko', 'waers', '', '', '',       'N', '', 'cuky', 5, null),
                          ('ekko', 'ernam', '', '', '',       'N', '', 'char', 12, null),
                          ('ekko', 'aedat', '', '', '',       'N', '', 'dats', 8, null),
                          ('ekko', 'reswk', '', '', '',       'N', '', 'char', 4, null),
                          ('ekko', 'frgzu', '', '', '',       'N', '', 'char', 8, null),
                          ('ekko', 'txt', '', '', '',       'N', '', 'char', 100, null);

insert into dd03l values ('ekpo', 'ebeln', '', '', '',        'Y', '', 'char', 10, null),
                         ('ekpo', 'ebelp', '', '', '',        'Y', '', 'char', 5, null),
                          ('ekpo', 'matnr', '', '', '',       'N', '', 'char', 18, null),
                          ('ekpo', 'netpr', '', '', '',       'N', '', 'curr',  18, 2),
                          ('ekpo', 'bprme', '', '', '',       'N', '', 'unit', 3, null),
                          ('ekpo', 'bpumz', '', '', '',       'N', '', 'dec', 5, null),
                          ('ekpo', 'bpumn', '', '', '',       'N', '', 'dec', 5, null),
                          ('ekpo', 'peinh', '', '', '',       'N', '', 'dec', 5, null),
                          ('ekpo', 'netwr', '', '', '',       'N', '', 'curr', 18, 2),
                          ('ekpo', 'menge', '', '', '',       'N', '', 'quan', 13, 3),
                          ('ekpo', 'meins', '', '', '',       'N', '', 'unit', 3, null);
insert into dd03l values ('so', 'so', '', '', '',        'Y', '', 'char', 10, null),
                         ('so', 'customer', '', '', '',        'N', '', 'char', 5, null),
                          ('so', 'amount', '', '', '',       'N', '', 'char', 18, null),
                          ('so', 'zterm', '', '', '',       'N', '', 'char',  4, null),
                          ('so', 'department', '', '', '',       'N', '', 'unit', 3, null),
                          ('so', 'txt', '', '', '',       'N', '', 'char', 100, null);
insert into dd03l values  ('soitem', 'so', '', '', '',        'Y', '', 'char', 10, null),
                          ('soitem', 'item', '', '', '',       'Y', '', 'char', 5, null),
                          ('soitem', 'matnr', '', '', '',       'N', '', 'curr',  18, 2),
                          ('soitem', 'quantity', '', '', '',       'N', '', 'quan', 3, null),
                          ('soitem', 'unit', '', '', '',       'N', '', 'unit', 5, null),
                          ('soitem', 'price', '', '', '',       'N', '', 'curr', 18, null);

drop table if exists ih;
create table if not exists ih(ih int, ssql varchar(512), dbfn varchar(200), datafn varchar(200), primary key (ih));
insert into ih values (1, 'select ot, name from ot', 'ot, name', 'ot, name');
insert into ih values (2, 'select ebeln, comment from ot1ekko', 'ebeln, comment', 'ebeln, comment');
insert into ih values (3, 'select so, comment from ot2so', 'so, comment', 'so, comment');
drop table if exists ihlink;
create table if not exists ihlink(ih int, tn varchar(30), fn varchar(30), opt int, primary key(ih, tn, fn));
insert into ihlink values (1, 'ot', 'ot', 0);
insert into ihlink values (1, 'ot', 'name', 0);
insert into ihlink values (2, 'ekko', 'ebeln', 0);
insert into ihlink values (3, 'so', 'so', 0);

drop table if exists ot;
create table if not exists ot(ot int, name varchar(30), primary key (ot));
insert into ot values (1, 'SAP Purchase Orders');
insert into ot values (2, 'E-Commerce SO');

drop table if exists ots;
create table if not exists ots(ot int, tblname varchar(30), suptblname varchar(30), primary key (ot, tblname));
insert into ots values(1, 'ekko', '');
insert into ots values(1, 'ekpo', 'ekko');
insert into ots value(2, 'so', '');
insert into ots value(2, 'soitem', 'so');

drop table if exists txts;
create table if not exists txts(id int, locale char(10), txt varchar(512), tblname varchar(30), fldname varchar(30), comment varchar(30), primary key (id, locale));
create index txt001 on txts(tblname, fldname);

drop table if exists otf;
create table if not exists otf(ot int, tblname varchar(30), fldname varchar(30), isKey boolean, qfield boolean, txtsid int, primary key(ot, tblname, fldname));
insert into otf (ot, tblname, fldname, isKey, qfield)
               values (1, 'ekko', 'ebeln', true, true),
                       (1, 'ekko', 'lifnr', false, true),
                       (1, 'ekko', 'netwr', false, true),
                       (1, 'ekko', 'zterm', false, true),
                       (1, 'ekko', 'ekorg', false, true),
                       (1, 'ekko', 'reswk', false, true),
                       (1, 'ekko', 'frgzu', false, true),
                       (1, 'ekpo', 'ebeln', true, false),
                       (1, 'ekpo', 'ebelp', true, false),
                       (1, 'ekpo', 'matnr', false, false),
                       (1, 'ekpo', 'netpr', false, false),
                       (1, 'ekpo', 'peinh', false, false),
                       (1, 'ekpo', 'bprme', false, false),
                       (1, 'ekpo', 'bpumz', false, false),
                       (1, 'ekpo', 'bpumn', false, false),
                       (1, 'ekpo', 'menge', false, false),
                       (1, 'ekpo', 'meins', false, false),
                       (1, 'ekpo', 'netwr', false, false),
                       (2, 'so', 'so', true, true),
                       (2, 'so', 'customer', false, true),
                       (2, 'so', 'amount', false, true),
                       (2, 'so', 'zterm', false, true),
                       (2, 'so', 'department', false, true),
                       (2, 'soitem', 'so', true, false),
                       (2, 'soitem', 'item', true, false),
                       (2, 'soitem', 'matnr', false, false),
                       (2, 'soitem', 'quantity', false, false),
                       (2, 'soitem', 'unit', false, false),
                       (2, 'soitem', 'price', false, false);

drop table if exists otstc;
drop table if exists otrlc;
create table if not exists otstc(ot int, stc char(10), stepcode int, primary key(ot, stc));
create table if not exists otrlc(ot int, rlc char(21),  fromstc char(10), tostc char(10), cond varchar(200), primary key (ot, rlc));
insert into otstc values (1, '-', 0),
                         (1, '0', 1),
                         (1, 'a0', 10),
                         (1, 'z', 100),
                         (1, 'b0', 20),
                         (1, 'b1', 21),
                         (2, '-', 0),
                         (2, '0', 1),
                         (2, 'z', 100);
insert into otrlc values (1, 'a0', '0', 'a0', 'ot1ekko.ekorg like \'CNC%\''),
                         (1, 'a-', '0', '-', 'ot1ekko.ekorg like \'CNC%\''),
                         (1, 'a0-', 'a0', '-', ''),
                         (1, 'a0z', 'a0', 'z', ''),
                         (2, '0z', '0', 'z', ''),
                         (2, '0-', '0', '-', '');
insert into otrlc values (1, 'b0', '0', 'b0', 'ot1ekko.ekorg = \'EAI\' or ot1ekko.ekorg = \'SAP\''),
                         (1, 'b1', 'b0', 'b1', 'ot1ekko inner join ot1ekpo on ot1ekko.ebeln = ot1ekpo.ebeln====group by ot1ekko.ebeln having sum(ot1ekpo.netwr) >= 20000'),
                         (1, 'b0z', 'b0', 'z', 'ot1ekko inner join ot1ekpo on ot1ekko.ebeln = ot1ekpo.ebeln====group by ot1ekko.ebeln having sum(ot1ekpo.netwr) < 20000'),
                         (1, 'b1z', 'b1', 'z', ''),
                         (1, 'b-', '0', '-', 'ot1ekko.ekorg = \'EAI\' or ot1ekko.ekorg = \'SAP\''),
                         (1, 'b0-', 'b0', '-', ''),
                         (1, 'b1-', 'b1', '-', '');

drop table if exists role;
create table if not exists role(role varchar(20), txt varchar(50), primary key (role));
insert into role values ('CNC1', 'CNC 1 owner'),
                ('CNC2', 'CNC 2 owner'),
                ('MRO manager', 'MRO manager'),
                ('SAP manager', 'SAP manager'),
                ('APP director', 'APP director'),
                ('EAI manager', 'EAI manager'),
                ('CEO', 'CEO'),
                ('admin', 'admin'),
                ('EBIZ director', 'EBIZ director');

drop table if exists roleorg;
create table if not exists roleorg(role varchar(20), org char(50), primary key(role, org));
insert into roleorg values('CNC1', 'CNC1'),
                          ('CNC2', 'CNC2'),
                          ('MRO manager', 'CNC1'),
                          ('MRO manager', 'CNC2'),
                          ('SAP manager', 'SAP'),
                          ('APP director', 'SAP'),
                          ('EAI Manager', 'EAI'),
                          ('APP director', 'EAI'),
                          ('CEO', 'SAP'),
                          ('CEO', 'EAI'),
                          ('CEO', 'CNC1'),
                          ('CEO', 'CNC2'),
                          ('EBIZ directror', 'EBIZ');

drop table if exists roleot;
create table if not exists roleot(role varchar(20), ot int, lt int, primary key(role, ot));
insert into roleot values('CNC1', 1, 1000100000),
                          ('CNC2', 1, 1000100000),
                          ('MRO manager', 1, 1000100001),
                          ('SAP manager', 1, 1000100002),
                          ('APP director', 1,1000100002),
                          ('EAI Manager', 1, 1000100002),
                          ('CEO', 1, 1000100002),
                          ('CEO', 2, 1000100002),
                          ('EBIZ director', 2, 1000100002);

drop table if exists lt;
create table if not exists lt(lt int, nametxt int);
insert into lt values (1, 1000100000), (2, 1000100001), (3, 1000100002);
insert into txts (id, locale, txt, comment)
   values (1000100000, 'cn', '任务', 'list type task'),
          (1000100001, 'cn', '相关', 'list type Relevant'),
          (1000100002, 'cn', '全部', 'list type all'),
          (1000100000, 'en-US', 'Task', 'list type Task'),
          (1000100001, 'en-US', 'Relevant', 'list type Relevant'),
          (1000100002, 'en-US', 'All', 'list type all'),
          (1000000000, 'cn', '过滤', ''),/*Not for list type*/
          (1000000001, 'cn', '最多', ''),
          (1000000000, 'en-US', 'filter', ''),
          (1000000001, 'en-US', 'Max items', '')
   on duplicate key update id = values(id), locale = values(locale), txt = values(txt), comment = values(comment);

drop table if exists rolerlc;
create table if not exists rolerlc(role varchar(20), ot int, rlc char(21), primary key(role, ot, rlc));
insert into rolerlc values ('CNC1', 1, 'a0'),
                   ('CNC1', 1, 'a-'),
                   ('CNC2', 1, 'a0'),
                   ('CNC2', 1, 'a-'),
                   ('MRO manager', 1, 'a0z'),
                   ('MRO manager', 1, 'a0-'),
                   ('SAP manager', 1, 'b0'),
                   ('SAP manager', 1, 'b-'),
                   ('EAI manager', 1, 'b0'),
                   ('EAI manager', 1, 'b-'),
                   ('APP director', 1, 'b1'),
                   ('APP director', 1, 'b0z'),
                   ('APP director', 1, 'b0-'),
                   ('CEO', 1, 'a0z'),
                   ('CEO', 1, 'b1-'),
                   ('CEO', 1, 'a0-'),
                   ('CEO', 1, 'b1z'),
                   ('CEO', 2, '0z'),
                   ('CEO', 2, '0-'),
                   ('EBIZ director', 2, '0z'),
                   ('EBIZ director', 2, '0-')
                   ;

drop table if exists u;
create table if not exists u(u int, name varchar(50), password char(64), autolist boolean, cookiedays int not null default 2, locale char(10),
                            dateformat char(20), pagesize int, lt int, primary key (u));
create unique index uname on u (name);
insert into u values (2, 'admin', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (1, 'Mogao', '', true, 1, 'cn', 'YYYY-MM-DD', 50, 1000100002),
             (3, 'Yaoshun', '', false, 1, 'cn', 'YYYY-MM-DD', 50, 1000100002),
             (4, 'Shimin', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100001),
             (5, 'Guanyin', '', false, 2, 'cn', 'YYYY-MM-DD', 50, 1000100002),
             (6, 'Jingwei', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (7, 'Mozi',  '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (8, 'Yugong', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100001),
             (21, 'Wusong', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (22, 'Songjiang', '', true, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (36, 'Saodiseng', '', true, 1, 'en-US', 'MM/DD/YY', 50, 1000100000),
             (37, 'Fangzheng', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100000),
             (38, 'Buhui', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (39, 'Dust cleaner', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (72, 'Eight dont', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002),
             (73, 'John', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100000),
             (76, 'Julia', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100000),
             (77, 'Walker', '', false, 1, 'en-US', 'MM/DD/YY', 50, 1000100002)
             ;

drop table if exists urole;
create table if not exists urole(u int, role varchar(20), primary key (u, role));
insert into urole values (2, 'admin'),
                         (1, 'APP director'),
                         (3, 'EBIZ director'),
                         (4, 'MRO manager'),
                         (5, 'CEO'),
                         (6, 'SAP Manager'),
                         (7, 'admin'),
                         (8, 'MRO manager'),
                         (21, 'APP director'),
                         (72, 'SAP manager'),
                         (73, 'CNC1'),
                         (76, 'CNC2'),
                         (77, 'CEO'),
                         (37, 'CNC1'),
                         (38, 'APP'),
                         (36, 'CNC2'),
                         (22, 'EAI Manager'),
                         (39, 'EAI Manager');

drop table if exists ses;
create table if not exists ses(skey char(64), u int, timekey bigint, logintime bigint, useragent varchar(128), primary key(skey));
create index uses on ses(u);
create index sesLoginTime on ses(logintime);
/* ---- u: user
---- rlc: release code. Next rlc shall be determined automatically by workflow / quantity / amount / etc.
---- stc: state code.
---- ot: object type.
---- ots: object type structure.
---- otf: object type field.                 Except field extracted from SAP, organization and state code need to be defined as field of of top level table.
---- otstc: object type state codes
---- tbl: table
---- fld: field
---- sup: super node. sub: sub node.
---- Netwr is calculated by refering ekko-knumv to konv then calculate with sum of all condition? (or only condition Non-deductible tax and discount?). Some of them could be negative
---- bpumz: numerator, bpumn: denominator for conversion from order price unit to order unit. bprme: order price unit.
---- dd03l: dictionary table of table fields.
---- frgzu: release status
*/
