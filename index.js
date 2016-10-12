/*
*
*    http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.V_W7VJMrKHo
*
*/
const express = require('express')
const router = express.Router()
const pg = require('pg')
const path = require('path')
const port = 3000
const connectionString = 'postgres://localhost:5432/todo'
const bodyParser = require('body-parser')

const fs = require('fs')
const app = express()

app.use(express.static(__dirname + '/client'))
app.get('/', function(req, res){
  res.sendFile('index.html')
})


app.use(bodyParser());

app.post('/api/v1/todos', function(req, res, next) {

  const results = [];

  // Grab data from http request
  const data = {text: req.body.text, complete: false};


  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {

    // Handle connection errors
    if(err) {
      done();
      console.log('error:', err)
      return res.status(500).json({success: false, data: err});
    }

    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)', [data.text, data.complete]);

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {

      done();
      return res.json(results);
    })
  })
})

app.get('/api/v1/todos', (req, res, next) => {
  const results = []

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {

    // Handle connection errors
    if(err) {
      done()
      console.log('error:', err)
      return res.status(500).json({success: false, data: err})
    }

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC;')

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row)
    })

    query.on('end', () => {
      done()
      return res.json(results)
    })
  })
})


app.delete('/api/v1/todos/:todo_id', (req, res, done) => {
  const results = []

  // Grab data from the URL parameters
  const id = req.params.todo_id

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {

    // Handle connection errors
    if('error:', err) {
      done()
      console.log('error:', err)
      return res.status(500).json({success: false, data: err})
    }

    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id])

    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC')

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row)
    })

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done()
      return res.json(results)
    })
  })
})





app.listen(3000, ()=>{console.log('listening on port', port)})