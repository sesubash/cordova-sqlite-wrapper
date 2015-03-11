/*
 * Wrapper(Middleware) for websql DB transactions.
 * Works well with Cordova sqlite plugin 'https://github.com/brodysoft/Cordova-SQLitePlugin'
 * ----------------------------------------------------------------------------------------
 * Author: Subash S 
 * Website: http://www.subashselvaraj.com
 * Date Created: 28th FEB, 2015
 *
 * GIT : https://github.com/sesubash/cordova-sqlite-wrapper.git
 * 
 */
//==============================================
// TODO: Make a way to handle multiple database
//==============================================
var DBHandler = (function() {

              var db, dbName = "app.db";

              //----------------------
              // Initiate the database
              //----------------------
              function initDatabase() {
                //
                if (window.sqlitePlugin) {
                  db = window.sqlitePlugin.openDatabase({name: dbName});
                }else if (window.openDatabase) {
                  db = window.openDatabase("app", "1.0", "MyApp", 200000);
                }
              } 

              //---------------------------------
              // Do appropriate stuffs on error  
              //--------------------------------- 
              function onError(tx, error) {
                console.log(error.message);
              }

              //-------------------------------------------------------------------------
              // Checks if the table with the name passed is exists in the database and 
              // returns status(true/false) via callback
              // 
              // Params: @table    => name of the table
              //         @callback => function to be called upon query execution
              //-------------------------------------------------------------------------
              function isExists(table, callback) {
                db.transaction(function(tx) {
                  tx.executeSql("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name= '"+table+"'", [], function(tx, result) {
                    callback(result);
                  }, onError);
                });                
              }
              //---------------------------------------------------------------
              // Selects all records in the table and returns via callback
              // Params: @table    => name of the table
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function getAllRecords(table, callback) {
                db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM "+table, [], function(tx, result) {                    
                    callback(result);
                  });
                });
              }

              //---------------------------------------------------------------
              // Selects records in the table based on condition and columns passed 
              // and returns via callback
              // Params: @table    => name of the table
              //         @columns  => colums to be fetched as query formatted string
              //                      eg., "id, student_id, data" or "*"
              //         @condition  => condition to be checked as query formatted string
              //                      eg., "student_id = 2 AND id = 1"
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function getRecord (table, columns, condition, callback) {
                console.log("SELECT "+columns+" FROM "+table+" WHERE "+condition);
                db.transaction(function(tx) {
                  tx.executeSql("SELECT "+columns+" FROM "+table+" WHERE "+condition, [], function(tx, result) {
                    callback(result);
                  }, onError);
                });
              }
              
              //---------------------------------------------------------------
              // Creates table with the name and columns passed
              // Params: @table    => name of the table
              //         @columns  => colums to be created as query formatted string
              //                      eg., "id integer primary key, student_id integer, data text"
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function createTable(table, columns, callback) {
                db.transaction(function(tx) {
                  tx.executeSql("CREATE TABLE "+table+" ("+columns+")", [], function(tx, result) {  
                        console.log("=====created table :"+table);
                        callback(result);
                      },
                      onError);
                });
              }

              //---------------------------------------------------------------
              // Add new record with passed values
              // Params: @table    => name of the table
              //         @columns  => Array of colums to be inserted as query formatted string
              //                      eg., ["student_id", "sem_id"];
              //         @values  => Array of values to be inserted as query formatted string
              //                      eg., ["1", "2"];           
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function newRecord(table, columns, values, callback) {
                console.log(columns+":"+values)
                var _columns = columns.join(",");
                db.transaction(function(tx) {
                  tx.executeSql("INSERT INTO "+table+" ("+_columns+") VALUES ("+getValuePlaceHolder(_columns)+")", values,
                      function(tx, result) {                        
                        //console.log("insertID", result.insertId, "rows affected", result.rowsAffected);
                        callback(result);
                      },
                      onError);
                });
              }

              //---------------------------------------------------------------
              // Update record with passed condition and values
              // Params: @table    => name of the table
              //         @condition  => condition to be checked as query formatted string
              //                      eg., "student_id = 2 AND id = 1"
              //         @columns  => Array of colums to be updated as query formatted string
              //                      eg., ["student_id", "sem_id"];
              //         @values  => Array of values to be updated as query formatted string
              //                      eg., ["1", "2"];           
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function updateRecord(table, condition, columns, values, callback) {
                console.log(condition);
                console.log(values);
               
                db.transaction(function(tx) {
                  tx.executeSql("UPDATE "+table+" SET "+getUpdateColumns(columns)+" WHERE "+condition, values , 
                    function (tx, result) {
                      callback(result);
                    }, onError);
                });
                
              }


              //---------------------------------------------------------------
              // Delete record with passed condition
              // Params: @table    => name of the table
              //         @condition  => condition to be checked as query formatted string
              //                      eg., "student_id = 2 AND id = 1"
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function deleteRecord(table, condition, callback) {
                db.transaction(function(tx) {
                  tx.executeSql("DELETE FROM "+table+" WHERE "+condition, [],
                      function(tx, result) { 
                        callback(result) 
                      },
                      onError);
                });
              }

              //---------------------------------------------------------------
              // Delete table with passed name
              // Params: @table    => name of the table
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function dropTable(table, callback) {
                db.transaction(function(tx) {
                  tx.executeSql("DROP TABLE "+table, [],
                      function(tx, result) { callback(result) },
                      onError);
                });
              }
             
              //---------------------------------------------------------------
              // Get table schema
              // Params: @table    => name of the table
              //         @callback => function to be called upon query execution
              //----------------------------------------------------------------
              function getTableSchema(table, callback){
                db.transaction(function(tx){
                  tx.executeSql("PRAGMA table_info("+table+")",[], function(tx, result){
                    callback(result);
                  });
                });
              }

              //========================
              //  Helper functions
              //========================
              
              //---------------------------------------------------------------
              // Get place holder as query formatted string for the columns passed
              // Params:  @columns  => Array of colums to be updated as query formatted string
              //                      eg., ["student_id", "sem_id"];
              //----------------------------------------------------------------
              function getValuePlaceHolder(columns) {
                var valuePlaceHolder = [];
                columns.split(",").forEach(function () {
                  valuePlaceHolder.push("?");
                });               
                return (valuePlaceHolder.length > 1) ? valuePlaceHolder.join(",") : valuePlaceHolder[0];;
              }

              //---------------------------------------------------------------
              // Get columns to be updated as query formatted string from the columns passed
              // Params:  @columns  => Array of colums to be updated as query formatted string
              //                      eg., ["student_id", "sem_id"];
              //----------------------------------------------------------------
              function getUpdateColumns(columns) {

                var result = [];
                columns.forEach(function (value) {
                   result.push(value+" = ? ");
                });                

                return result.join(",");
              }

              return {
                initDatabase: initDatabase,
                isExists: isExists,
                getAllRecords: getAllRecords,
                getRecord: getRecord,
                getCount: getCount,
                getTableSchema: getTableSchema,
                newRecord: newRecord,
                createTable: createTable,
                updateRecord: updateRecord,
                deleteRecord: deleteRecord,
                dropTable: dropTable
              }
            })();
