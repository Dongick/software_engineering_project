const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const notice_function = require('../modules/notice_function');
const multer = require('multer');
const upload = multer();

/**
 * @openapi 
 * /notice/{subjectID}/{semesterID}/{noticeID}/delete:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *    - name: noticeID
 *      in: path
 *      required: true
 *      description: 공지사항 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 공지사항 삭제
 *    description: 공지사항 삭제
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 공지사항 삭제 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:noticeID/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;
            let noticeid = req.params.noticeID - 1;
            db.promise().query(`delete from notice where id = (select id from
                (select id from notice where professor_name=? and semester=? and sub_code = ?
                order by id limit ?,1) tmp);`,
                [token.name, semester, sub_code, noticeid]
            );
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /assignment/{subjectID}/{semesterID}/{assignmentID}:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *    - name: assignmentID
 *      in: path
 *      required: true
 *      description: 과제 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 해당 과제 조회
 *    description: 해당하는 번호의 과제 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과제 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                assignment:
 *                  type: object
 *                  properties:
 *                  title:
 *                    type: string
 *                    description: 과제 제목
 *                  content:
 *                    type: string
 *                    description: 과제 내용
 *                  start_date:
 *                    type: string
 *                    format: date-time
 *                    description: 제출 시작일
 *                  due_date:
 *                    type: string
 *                    format: date-time
 *                    description: 제출 마감일
 *                assignment_file:
 *                  type: array
 *                  description: 과제 파일 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      file_name:
 *                        type: string
 *                        description: 과제 파일 이름
 *                      file_data:
 *                        type: object
 *                        properties:
 *                          type:
 *                            type: string
 *                            description: 파일 타입
 *                          data:
 *                            type: array
 *                            items:
 *                              type: integer
 *                              description: 파일 데이터 (10진수)
 *                            desciption: 파일 데이터
 *                assignment_submit:
 *                  type: object
 *                  properties:
 *                  title:
 *                    type: string
 *                    description: 과제 제출 제목
 *                  content:
 *                    type: string
 *                    description: 과제 제출 내용
 *                assignment_submit_file:
 *                  type: array
 *                  description: 과제 제출 파일 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      file_name:
 *                        type: string
 *                        description: 과제 제출 파일 이름
 *                      file_data:
 *                        type: object
 *                        properties:
 *                          type:
 *                            type: string
 *                            description: 파일 타입
 *                          data:
 *                            type: array
 *                            items:
 *                              type: integer
 *                              description: 파일 데이터 (10진수)
 *                            desciption: 파일 데이터
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:assignmentID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assignmentid = req.params.assignmentID - 1;
            const userid = token.id;
            if(token.author == 1){
                const [id] = await db.promise().query(`select id from assignment where sub_code = ? and semester = ? order by id limit ?,1`,
                    [sub_code, semester, assignmentid]
                );
                const assignment_id = id[0].id;

                const [assignment_file] = await db.promise().query(`select file_name, file_data from assignment_file where assignment_id = ?`, [assignment_id]);
                const [assignment] = await db.promise().query(`select title, content, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') start_date, DATE_FORMAT(due_date, '%Y-%m-%d %H:%i:%s') due_date
                    from assignment where id = ?`, [assignment_id]
                );
                result = {
                    "assignment": assignment[0],
                    "assignment_file": assignment_file
                };
                const [check] = await db.promise().query(`select id from assignment_submit where assignment_id = ?`, [assignment_id]);
                if(check.length > 0){
                    const [submit_id] = await db.promise().query(`select id from assignment_submit where assignment_id = ?`, [assignment_id]);
                    const assignment_submit_id = submit_id[0].id;
                    
                    const [assignment_submit_file] = await db.promise().query(`select file_name, file_data from assignment_submit_file where assignment_submit_id = ?`, [assignment_submit_id]);
                    const [assignment_submit] = await db.promise().query(`select title, content,
                        from assignment_submit where id = ? and s.student_id = ?`, [assignment_submit_id, userid]
                    );
                    result.assignment_submit = assignment_submit[0];
                    result.assignment_submit_file = assignment_submit_file;
                }
                return res.status(200).send(result);
            } else{
            }
        }
    } catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /assignment/{subjectID}/{semesterID}:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *  get:
 *    summary: 해당 과목의 과제 전체 조회
 *    description: 과제 전체 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과목의 과제 전체 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                    description: 과제 제목
 *                  start_date:
 *                    type: string
 *                    format: date-time
 *                    description: 제출 시작일
 *                  due_date:
 *                    type: string
 *                    format: date-time
 *                    description: 제출 마감일
 *                  submit_check:
 *                    type: boolean
 *                    description: 제출 여부
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;
            if(token.author == 1){
                const [result] = await db.promise().query(`select a.title, DATE_FORMAT(a.start_date, '%Y-%m-%d %H:%i:%s') start_date, DATE_FORMAT(a.due_date, '%Y-%m-%d %H:%i:%s') due_date, s.submit_check
                    from assignment a join assignment_submit s on a.id = s.assignment_id
                    where s.student_id = ? and a.semester = ? and a.sub_code = ? order by a.id desc`,
                    [token.id, semester, sub_code]
                );
                return res.status(200).send(result);
            } else{
            }
        }
    }
    catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /notice/{subjectID}/{semesterID}/{noticeID}/update:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *    - name: noticeID
 *      in: path
 *      required: true
 *      description: 공지사항 번호
 *      schema:
 *        type: integer
 *  post:
 *    summary: 공지사항 수정
 *    description: 공지사항 수정
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: 제목
 *              content:
 *                type: string
 *                description: 본문
 *              files:
 *                type: string
 *                format: binary
 *                description: 파일
 *    responses:
 *      '200':
 *        description: 공지사항 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/:noticeID/update', upload.array('files'), async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;
            let noticeid = req.params.noticeID - 1;
            let title = req.body.title;
            let content = req.body.content;
            let files = req.files;
            const notice_id = await notice_function.select_noticeid(token.name, semester,sub_code,noticeid);
            db.promise().query(`update notice set title=?, content=? where id=?`, [title, content, notice_id]);
            const [result2] = await notice_function.select_noticefile(notice_id);
            if(result2.length > 0){
                await db.promise().query(`delete from notice_file where notice_id=?;`, [notice_id]);
            }
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                notice_function.insert_noticefile(notice_id, file_info);
            }
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /assignment/{subjectID}/{semesterID}/{assignmentID}/create:
 *  parameters:
 *    - name: subjectID
 *      in: path
 *      required: true
 *      description: 과목 코드
 *      schema:
 *        type: string
 *    - name: semesterID
 *      in: path
 *      required: true
 *      description: 년도-학기
 *      schema:
 *        type: string
 *    - name: assignmentID
 *      in: path
 *      required: true
 *      description: 과제 번호
 *      schema:
 *        type: integer
 *  post:
 *    summary: 해당 과제 제출
 *    description: 해당 과제 제출
 *    security:
 *      - CookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: 제목
 *              content:
 *                type: string
 *                description: 본문
 *              files:
 *                type: array
 *                items:
 *                  type: string
 *                  format: binay
 *                  description: 파일데이터
 *            required:
 *              - title
 *              - content
 *    responses:
 *      '200':
 *        description: 과제 제출 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/:assignmentID/create', upload.array('files'), async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assignmentid = req.params.assignmentID - 1;
            const title = req.body.title;
            const content = req.body.content;
            const files = req.files;

            const [id] = await db.promise().query(`select id from assignment where sub_code = ? and semester = ? order by id limit ?,1`,
                [sub_code, semester, assignmentid]
            );
            const assignment_id = id[0].id;

            await db.promise().query(`insert into 
                assignment_submit(assignment_id,student_id,title,content)
                values (?,?,?,?);`,
                [assignment_id,token.id,title,content]
            );
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [submit_id] = await db.promise().query(`select id from assignment_submit order by id desc limit 1;`,);
                const assignment_submit_id = submit_id[0].id;
                const values = file_info.map(([name, data]) => [assignment_submit_id, name, data]);
                await db.promise().query(`insert into assignment_submit_file(assignment_submit_id, file_name, file_data) values ?;`,[values]);
            }
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;