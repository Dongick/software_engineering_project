const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', function(req, res) {
    let student_id = req.body.id;
    let student_password = req.body.password;
    db.query('SELECT * FROM studenttable WHERE id = ? AND password = ?',
    [student_id, student_password], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            res.status(200);
            res.send('good');
        }
        else{
            res.status(401);
            res.send('bad');
        }
    })
});

module.exports = router;