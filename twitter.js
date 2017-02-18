  //console.log('Bot is running');
var async       = require('async');
var twit        = require('twit');
var mysql       = require('mysql');
var config      = require('./connect.js');
var mysqlconfig = require('./mysqlconnect.js');
var tweet       = new twit(config);
var express     = require('express');
var app         = express();
var con         = mysql.createConnection(mysqlconfig);
var router      = express.Router();

con.connect(function(err){
  if(err){
    console.log("Database is not connected ..."+err);
    }else {
    console.log("database connecting ...");
  }
});

app.get('/', function (req, res) {
  if (!req.query) return res.sendStatus(400)
    var user_name   = req.query.user_name;
    var tweet_count = req.query.tweet_num;

    tweet.get('statuses/user_timeline', { screen_name:user_name, count: tweet_count}, function(err, data, response) {
    var asyncTasks  = []; 
    var responseObj = {};

    asyncTasks.push(insertTweets.bind(null, data, user_name, responseObj));
    asyncTasks.push(fetchTweetsWithThe.bind(null, user_name, responseObj));

    async.series(asyncTasks, function (error,response){
      if(error){
        return err;
      }
      res.send(responseObj.data);
    })
  })
})

app.listen(1337,function(){
  console.log('Listening at port 1337');
});


function insertTweets(data, user_name, responseObj,callback){
    for(var i=0;i<data.length;i++){
      var key     = {name:user_name, tweet_id:i, tweet: data[i].text};
      var query = 'INSERT INTO `tweet` SET ?';
      con.query(query, [key], function(err,data,response){
      if(err){
        return err;
      }
      console.log('Tweets inserted');
     }) 
    }
  callback();
}  


function fetchTweetsWithThe(user_name, responseObj, callback){
  var tasks = [];
  var key   = user_name;
  var query = "SELECT tweet FROM tweet WHERE name=?";
  con.query(query,[key], function(err,rows){
    if(err){
      return err;
    }
    for(i=0; i<rows.length; i++){
        tasks.push("Tweet"+ i + ":"+ rows[i].tweet);
      }  
      responseObj.data=tasks;
      callback();                     
  })    
}
