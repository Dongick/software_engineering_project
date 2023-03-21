const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', function(req, res) {
    let professor = req.body;
    db.query(`insert into 
    professortable(id, password, name, school_name, major, email)
    values(?,?,?,?,?,?);`,
    [professor.id,professor.password,professor.name,professor.school_name,professor.major,professor.email], 
    function(err, result, field){
        if(err) throw err;
        res.status(200);
        res.send('회원가입 되었습니다.');
    })
});

router.post('/id_check', function(req, res) {
    let professor_id = req.body.id;
    db.query('SELECT id FROM professortable WHERE id = ?',
    [professor_id], function(err, result, field){
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