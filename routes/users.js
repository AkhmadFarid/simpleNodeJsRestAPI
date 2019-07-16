const express = require('express')
const mysql = require('mysql')
const app = express()
const dbConfig = require('../serverConnection')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbConfig.database.host,
    user: dbConfig.database.user,
    password: dbConfig.database.password,
    port: dbConfig.database.port,
    database: dbConfig.database.database,
    insecureAuth : true
})

function getConnection() {
    return pool
}

app.route('/')
    .get((req, res) => {
        getConnection().query("SELECT * FROM user", (err, rows, fields) => {
            if(err) {
                res.sendStatus(500)
                return
            }
            else {
                obj = {print: rows}
                res.render('homepage', obj)
            }
        })
    })
    .post((req, res) => {

        const firstName = req.body.create_firstName
        const lastName = req.body.create_lastName
    
        getConnection().query("INSERT INTO user (user_id, firstName, lastName) VALUES (default, ?, ?)", [firstName, lastName], (err, results, fields) => {
            if(err) {
                res.sendStatus(500)
                return
            }
            else {
                res.redirect("/users")
            }
        })
    })

app.route('/edit/(:id)')
    .get((req, res, next) => {
        getConnection().query('SELECT * FROM user WHERE user_id = ?', [req.params.id], function(err, rows, fields){
            console.log("sini la tu")
            if(err){
                throw err
            }else{
                console.log(rows)
                res.render('edit', {
                    user_id: rows[0].user_id,
                    firstName: rows[0].firstName,
                    lastName: rows[0].lastName
                })
            }
        })
    })
    .put((req, res, next) => {
        // Input Form Validation
        req.assert('firstName', 'Required First Name!').notEmpty()
        req.assert('lastName', 'Require Last Name!').notEmpty()

        var errors = req.validationErrors()

        if(!errors){
            var playerData = {
                firstName: req.sanitize('firstName').escape().trim(),
                lastName: req.sanitize('lastName').escape().trim()
            }
            getConnection().query('UPDATE user SET ? WHERE user_id =' + req.params.id, playerData, function (err, result) {
                // If Throw Error
                if (err) {
                    req.flash('error', err)
                    res.render('edit', {
                        user_id: req.params.id,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    })
                    // res.redirect('/')
                } else {
                    req.flash('success', 'Employee Data Input Successfully!')
                    res.render('edit', {
                        user_id: req.params.id,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    })
                }
            })
        } else {
            // When error occurs, the message will show.
            var error_msg = ''
            errors.forEach(function (error) {
                error_msg += error.msg + '</br>'
            })
            req.flash('error', error_msg)
            res.render('edit', {
                user_id: req.params.id,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            })
        }
    })

app.route('/users')
    .get((req, res, next) => {
        getConnection().query('SELECT * FROM user', (err, rows, fields) => {
            if(err) {
                res.sendStatus(500)
                return
            }
            else {
                obj = {print: rows}
                res.render('list', obj)
            }
        })
    })
    .post((req, res, next) => {
        const lastName = req.body.create_lastName

        if(lastName != undefined && lastName != '') {
            getConnection().query('SELECT * FROM user WHERE lastName LIKE "%"?"%"', [lastName], (err, rows, fields) => {
                if(err) {
                    res.sendStatus(500)
                    return
                }
                else {
                    obj = {print: rows}
                    res.render('list', obj)
                }
            })
        }
        else {
            getConnection().query('SELECT * FROM user', (err, rows, fields) => {
                if(err) {
                    res.sendStatus(500)
                    return
                }
                else {
                    obj = {print: rows}
                    res.render('list', obj)
                }
            })
        }

    })

app.get('/users/:id', (req, res) => {

    const user_id = req.params.id

    getConnection().query("SELECT * FROM user WHERE user_id = ?", [user_id], (err, rows, fields) => {
        if(err) {
            res.sendStatus(500)
            return
        }
        else {
            obj = {print: rows}
            res.render('list', obj)
        }
    })
})

app.delete('/delete/:id', (req, res) => {
    var playerId = {
        id: req.params.id
    }

    getConnection().query('DELETE FROM user WHERE user_id = ' + req.params.id, playerId, function(err, result){
        if(err){
            throw err
        }else{
            res.redirect('/')
        }
    })
})

module.exports = app