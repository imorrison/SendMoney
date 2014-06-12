'use strict';

var express = require('express');
var app = express();
var morgan = require('morgan');
var transactionData = require('./transaction-data.json');

app.use(morgan());
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/compiled'));


app.get('/api/transactions', function(req, res) {
  var rowSize = 10;
  var rowSpecified = req.query.hasOwnProperty('row');
  var start = rowSpecified ? +req.query.row : 0;
  var end = start+rowSize-1;
  var transactions = transactionData.slice(start, end);

  var json = {
    data: transactions,
    nextUrl: '/api/transactions/?row=' + (start + rowSize)
  };

  if(end > transactionData.length) {
    json.nextUrl = '';
  }

  res.json(json);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Running on port 3000');
});
