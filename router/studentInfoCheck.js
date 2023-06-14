const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /studentInfoCheck:
 *  get:
 *    summary: 전체학생 조회
 *    description: 전체학생 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '201':
 *        description: 교수일 때 전체 학생 조회
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                studentInfo:
 *                  type: array
 *                  description: 해당 학생 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        description: 학생 이름
 *                      major:
 *                        type: string
 *                        description: 학과
 *                      email:
 *                        type: string
 *                        description: 이메일
 *                      phone_number:
 *                        type: string
 *                        description: 전화번호
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

/* router.get('/', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const [studentInfo] = await db.promise().query(`select name, major, email , phone_number from studenttable`);
            const result = {
                "studentInfo": studentInfo
            };
            return res.status(201).send(result);
        }
    } catch (err) {
        throw err;
    }
}) */

/**
 * @openapi
 * /studentInfoCheck:
 *  get:
 *    summary: 조건에 맞는 학생 조회
 *    description: 조건에 맞는 학생 조회
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              major:
 *                type: string
 *                description: 학과
 *              name:
 *                type: string
 *                description: 학생 이름
 *    responses:
 *      '201':
 *        description: 교수일 때 조건에 맞는 학생 조회
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                studentInfo:
 *                  type: array
 *                  description: 해당 학생 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        description: 학생 이름
 *                      major:
 *                        type: string
 *                        description: 학과
 *                      email:
 *                        type: string
 *                        description: 이메일
 *                      phone_number:
 *                        type: string
 *                        description: 전화번호
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const major = req.body.major;
            const name = req.body.name;
            const result = {}
            if(major){
                if(name){
                    const [studentInfo] = await db.promise().query(`select name, major, email , phone_number from studenttable
                        where major = ? and name = ?`, [major, name]
                    );
                    result.studentInfo = studentInfo;
                } else{
                    const [studentInfo] = await db.promise().query(`select name, major, email , phone_number from studenttable
                        where major = ?`, [major]
                    );
                    result.studentInfo = studentInfo;
                }
            } else{
                const [studentInfo] = await db.promise().query(`select name, major, email , phone_number from studenttable
                    where name = ?`, [name]
                );
                result.studentInfo = studentInfo;
            }
            return res.status(201).send(result);
        }
    } catch (err) {
        throw err;
    }
})

module.exports = router;