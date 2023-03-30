const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');

/**
 * @openapi
 * /login/find_id:
 *  post:
 *    summary: Find ID
 *    description: 학번 찾기
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: 이름
 *              email:
 *                type: string
 *                description: 이메일
 *    responses:
 *      '200':
 *        description: 아이디 찾기 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  description: 학번
 *      '401':
 *        description: 아이디 찾기 실패
 */

router.post('/find_id', function(req, res){
    let name = req.body.name;
    let email = req.body.email;
    db.query(`SELECT id FROM studenttable WHERE name = ? AND email = ?`,
    [name,email], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            res.status(200).send(result[0]);
        }else{
            db.query(`SELECT id FROM professortable WHERE name = ? AND email = ?`,
            [name,email], function(err2, result2, field){
                if(err2) throw err;
                if(result2.length > 0){
                    res.status(200).send(result2[0]);
                }
                else{
                    res.sendStatus(401);
                }
            })
        }
    })
})

/**
 * @openapi
 * /login/find_pw/change_pw:
 *  post:
 *    summary: Change password
 *    description: 비밀번호 변경
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                description: 새 비밀번호
 *              author:
 *                type: integer
 *                description: 권한
 *              id:
 *                type: integer
 *                description: 학번
 *    responses:
 *      '200':
 *        description: 학생 비밀번호 변경 성공
 *      '201':
 *        description: 교수 비밀번호 변경 성공
 */

router.post('/find_pw/change_pw', function(req, res){
    let password = req.body.password;
    let author = req.body.author;
    let id = req.body.id;
    if(author == 1){
        db.query('update studenttable set password = ? where id=?',
        [password, id], function(err, result, field){
            if(err) throw err;
            res.sendStatus(200);
        })
    }else{
        db.query('update professortable set password = ? where id=?',
        [password, id], function(err, result, field){
            if(err) throw err;
            res.sendStatus(201);
        })
    }
})


/**
 * @openapi
 * /login/find_pw:
 *  post:
 *    summary: Find password
 *    description: 비밀번호 찾기
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
 *              email:
 *                type: string
 *                description: 이메일
 *    responses:
 *      '200':
 *        description: 학생 비밀번호 찾기 성공
 *      '201':
 *        description: 교수 비밀번호 찾기 성공
 *      '401':
 *        description: 비밀번호 찾기 실패
 */

router.post('/find_pw', function(req, res){
    let id = req.body.id;
    let email = req.body.email;
    db.query(`SELECT * FROM studenttable WHERE id = ? AND email = ?`,
    [id,email], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            res.sendStatus(200);
        }else{
            db.query(`select * from professortable where id = ? and email = ?`,
            [id,email], function(err2, result2, field){
                if(err2) throw err;
                if(result2.length > 0){
                    res.sendStatus(201);
                }
                else{
                    res.sendStatus(401);
                }
            })
        }
    })
})

/**
 * @openapi 
 * /login:
 *  post:
 *    summary: Login user
 *    description: 학생 로그인을 처리합니다.
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
 *    responses:
 *      '200':
 *        description: 학생 로그인 성공
 *        headers:
 *          Set-Cookie:
 *            description: response access token
 *            schema:
 *              type: string
 *              example: access_token="MKGMEQDPDAL"
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
 *      '201':
 *        description: 교수 로그인 성공
 *        headers:
 *          Set-Cookie:
 *            description: response access token
 *            schema:
 *              type: string
 *              example: access_token="MKGMEQDPDAL"
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
 *      '401':
 *        description: 로그인 실패
 */

router.post('/', function(req, res) {
    let id = req.body.id;
    let password = req.body.password;
    db.query(`SELECT id, name, author FROM studenttable WHERE id = ? AND password = ?`,
    [id,password], function(err, result, field){
        if(err) throw err;
        if(result.length > 0){
            let accesstoken = jwt.sign(result);
            res.cookie('accesstoken', accesstoken);
            res.status(200).send(result[0]);
        }else{
            db.query(`SELECT id, name, author FROM professortable WHERE id = ? AND password = ?`,
            [id,password], function(err2, result2, field){
                if(err2) throw err;
                if(result2.length > 0){
                    let accesstoken = jwt.sign(result2);
                    res.cookie('accesstoken', accesstoken);
                    res.status(201).send(result2[0]);
                }
                else{
                    res.sendStatus(401);
                }
            })
        }
    })
})

module.exports = router;