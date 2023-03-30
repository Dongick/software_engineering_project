const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @openapi
 * /signup_student/id_check:
 *  post:
 *    summary: professor signup id_check
 *    description: 학생 회원가입 아이디 중복확인
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: 학번
 *    responses:
 *      '200':
 *        description: 사용가능 아이디
 *      '409':
 *        description: 중복된 아이디
 *        
 */

router.post('/id_check', function(req, res) {
    let student_id = req.body.id;
    db.query('SELECT * FROM studenttable WHERE id = ?',
    [student_id], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            res.sendStatus(409);
        }
        else{
            res.sendStatus(200);
        }
    })
});

/**
 * @openapi
 * /signup_student:
 *  post:
 *    summary: professor signup
 *    description: 학생 회원가입
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: 학번
 *              password:
 *                type: string
 *                description: 비밀번호
 *              name:
 *                type: string
 *                description: 학생 이름
 *              school_name:
 *                type: string
 *                description: 학교 이름
 *              major:
 *                type: string
 *                description: 학과
 *              email:
 *                type: string
 *                description: 이메일 주소
 *              phone_number:
 *                type: string
 *                description: 전화번호
 *    responses:
 *      '200':
 *        description: 회원가입 성공
 */

router.post('/', function(req, res) {
    let student = req.body;
    db.query(`insert into 
    studenttable(id, password, name, school_name, major, email,phone_number,author)
    values(?,?,?,?,?,?,?,?);`,
    [student.id,student.password,student.name,student.school_name,student.major,student.email,student.phone_number,1], 
    function(err, result, field){
        if(err) throw err;
        res.sendStatus(200);
    })
});

module.exports = router;