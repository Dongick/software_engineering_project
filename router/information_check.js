const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /information_check:
 *  get:
 *    summary: 유저 조회
 *    description: 해당하는 유저 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 학생 학번
 *                name:
 *                  type: string
 *                  description: 학생 이름
 *                school_name:
 *                  type: string
 *                  description: 학교이름
 *                major:
 *                  type: string
 *                  description: 학과
 *                email:
 *                  type: string
 *                  description: 이메일
 *                phone_number:
 *                  type: string
 *                  description: 학생 폰번호
 *      '201':
 *        description: 교수 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 교수 학번
 *                name:
 *                  type: string
 *                  description: 교수 이름
 *                school_name:
 *                  type: string
 *                  description: 학교이름
 *                major:
 *                  type: string
 *                  description: 학과
 *                email:
 *                  type: string
 *                  description: 이메일
 *                phone_number:
 *                  type: string
 *                  description: 교수 폰번호
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            console.log("1");
            if(token.author == 1){
                const [result] = await db.promise().query(`select id, name, school_name, major, email, phone_number from studenttable where id = ?`, [token.id]);
                return res.status(200).send(result[0]);
            } else{
                const [result] = await db.promise().query(`select id, name, school_name, major, email, phone_number from professortable where id = ?`, [token.id]);
                console.log(result);
                return res.status(201).send(result[0]);
            }
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /information_check/change_pw:
 *  post:
 *    summary: 비밀번호 변경
 *    description: 비밀번호 변경
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                description: 비밀번호
 *    responses:
 *      '200':
 *        description: 학생 비밀번호 변경 성공
 *      '201':
 *        description: 교수 비밀번호 변경 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/change_pw', async(req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const password = req.body.password;
            if(token.author == 1){
                db.promise().query('update studenttable set password = ? where id = ?', [password, token.id]);
                return res.sendStatus(200);
            } else{
                db.promise().query('update professortable set password = ? where id = ?', [password, token.id]);
                return res.sendStatus(201);
            }
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /information_check:
 *  post:
 *    summary: 개인정보 변경
 *    description: 개인정보 변경
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: 이메일
 *              phone_number:
 *                type: string
 *                description: 핸드폰 번호
 *    responses:
 *      '200':
 *        description: 학생 개인정보 변경 성공
 *      '201':
 *        description: 교수 개인정보 변경 성공
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
            const email = req.body.email;
            const phone_number = req.body.phone_number;
            if(token.author == 1){
                db.promise().query(`update studenttable set email = ?, phone_number = ? where id = ?`, [email, phone_number, token.id]);
                return res.sendStatus(200);
            } else{
                db.promise().query(`update professortable set email = ?, phone_number = ? where id = ?`, [email, phone_number, token.id]);
                return res.sendStatus(201);
            }
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;