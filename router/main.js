const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

router.get('/', async (req, res) =>{
    const token = jwt.verify(req.cookies['accesstoken']);
    if (Number.isInteger(token)){
        res.sendStatus(token);
    } else{
        const userid = token.id;
        if(token.author == 1){
            const [result] = await db.promise().query(`select e.semester, s.id student_id, s.name student_name, sub.sub_code, sub.name sub_name, sub.time, sub.class, p.name professor_name 
            from studenttable s join enrollment e on s.id = e.student_id
            join subject sub on e.sub_code = sub.sub_code
            join professortable p on p.id = sub.professor_id where s.id = ?`, [userid]);
            res.status(200).send(result);
        } else{

        }
    }
});

module.exports = router;