const pool = require('./db_config');

// To run a query we just pass it to the pool after we're done nothing has to be taken care of we don't have to return any client to the pool or close a connection
pool.query('SELECT $1::int AS number', ['2'], function (err, res) {
    if (err) {
        return console.error('error running query', err);
    }
    console.log('number:', res.rows[0].number);
    //output: number: 2
});

// Ask for a client from the pool
pool.connect(function (err, client, done) {
    if (err) {
        return console.error('error fetching client from pool', err);
    }

    //use the client for executing the query
    client.query('SELECT $1::int AS number', ['1'], function (err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);

        if (err) {
            return console.error('error running query', err);
        }
        console.log('number:', result.rows[0].number);
        //output: number: 1
    });
});

// Obtain exclusive client without pool using var client = new pg.Client(); See more at https://github.com/brianc/node-postgres#obtaining-an-exclusive-client-example


// Inserting into a table
pool.query('INSERT INTO people_details.people_details (name) VALUES ($1)', ["sudhir"], function (err) {
    if (err) return console.log("Query Execution Error", err);
    console.log("Query Execution Successful!");
});