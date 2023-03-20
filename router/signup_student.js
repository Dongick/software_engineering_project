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

router.post('/id_check', function(req, res) {
    
    let student_id = req.body.id;
    console.log(student_id);
    db.query('SELECT id FROM studenttable WHERE id = ?',
    [student_id], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            res.status(409);
            res.send('이미 존재하는 학번입니다.');
        }
        else{
            res.status(200);
            res.send('사용 가능한 학번입니다.');
        }
    })
});

module.exports = router;