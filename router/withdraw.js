const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /withdraw:
 *  get:
 *    summary: 회원탈퇴 페이지
 *    description: 회원탈퇴 페이지
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '202':
 *        description: 회원탈퇴 페이지
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                student:
 *                  type: array
 *                  description: 학생
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        description: 아이디
 *                      name:
 *                        type: string
 *                        description: 이름
 *                professor:
 *                  type: array
 *                  description: 교수
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        description: 아이디
 *                      name:
 *                        type: string
 *                        description: 이름
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
            if(token.author == 3){
                const [student] = await db.promise().query(`select id, name from studenttable`);
                const [professor] = await db.promise().query(`select id, name from professortable`);
                const result = {
                    "student": student,
                    "professor": professor
                };
                return res.status(202).send(result);
            }
        }
    }
    catch(err){
        throw err;
    }
});

/**
 * @openapi 
 * /withdraw/{userID}:
 *  parameters:
 *    - name: userID
 *      in: path
 *      required: true
 *      description: 회원ID
 *      schema:
 *        type: string
 *  delete:
 *    summary: 회원탈퇴
 *    description: 회원탈퇴
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '202':
 *        description: 관리자일 때 회원 탈퇴
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.delete('/:userID', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            if(token.author == 3){
                const id = req.params.userID;
                if(id.length == 10){
                    db.promise().query(`delete from studenttable where id = ?`, [id]);
                } else if(id.length == 12){
                    db.promise().query(`delete from professortable where id = ?`, [id]);
                }
                return res.sendStatus(202);
            }
        }
    }
    catch(err){
        throw err;
    }
});

module.exports = router;