const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

router.get('/', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const [student_info] = await db.promise().query(`select major, id student_id, name student_name from studenttable where id = ?`, [token.id]);
            const [result] = await db.promise().query(`select s.semester, s.sub_code, s.name sub_name, s.major_area, s.classification, s.credit, e.grade
            from subject s join enrollment e on s.semester = e.semester and s.sub_code = e.sub_code where e.student_id = ? order by s.semester desc, s.sub_code desc`, [token.id]);
            const total_result = {
            studnet_info: student_info[0],
            ...result,
            };
            return res.status(200).send(total_result);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;