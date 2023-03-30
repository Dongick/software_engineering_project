const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

router.post('/', function(req, res) {
    const token = jwt.verify(req.cookies['accesstoken']);
    if(token.author == 1){
        db.query(`SELECT * FROM subject where id=${token.id}`, function(err, result, field){
            console.log(result);
        })
    }else{

    }
});

module.exports = router;