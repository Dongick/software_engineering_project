const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const multer = require('multer');
const assignment_function = require('../modules/assignment_function');
const upload = multer();

/**
 * @openapi 
 * /assignment/{subjectID}/{semesterID}/{assignmentID}/delete:
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
 *    summary: 해당 과제 삭제 or 제출한 과제 삭제
 *    description: 해당 과제 삭제 or 제출한 과제 삭제
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 제출한 과제 삭제 성공
 *      '201':
 *        description: 교수일 때 해당 과제 삭제 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:assignmentID/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assignmentid = req.params.assignmentID - 1;

            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);
            if(token.author == 1){
                const [submit_id] = await db.promise().query(`select id from assignment_submit where assignment_id = ? and student_id = ?`, [assignment_id, token.id]);
                const assignment_submit_id = submit_id[0].id;

                db.query(`delete from assignment_submit where id = ?`, [assignment_submit_id]);
                return res.sendStatus(200);
            } else{
                db.query(`delete from assignment where id = ?`, [assignment_id]);
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
 *      '201':
 *        description: 교수일 때 해당 과제 조회 성공
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

            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);
            const assignment_file = await assignment_function.select_assignmentfile(assignment_id);   
            const assignment = await assignment_function.select_assignment(assignment_id);

            result = {
                "assignment": assignment,
                "assignment_file": assignment_file
            };

            if(token.author == 1){
                const assignment_submit_id = await assignment_function.select_assignment_submitid(assignment_id, userid);
                if(assignment_submit_id.length > 0){
                    const [assignment_submit_file] = await db.promise().query(`select file_name, file_data from assignment_submit_file where assignment_submit_id = ?`, [assignment_submit_id]);
                    const [assignment_submit] = await db.promise().query(`select title, content from assignment_submit where id = ?`, [assignment_submit_id]);
                    result.assignment_submit = assignment_submit[0];
                    result.assignment_submit_file = assignment_submit_file;
                }
                return res.status(200).send(result);
            } else{
                return res.status(201).send(result);
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
 *      '201':
 *        description: 교수일 때 해당 과목의 과제 전체 조회 성공
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
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            if(token.author == 1){
                const [assignment] = await db.promise().query(`select row_number() over (order by a.id) as id, a.title, DATE_FORMAT(a.start_date, '%Y-%m-%d %H:%i:%s') start_date, DATE_FORMAT(a.due_date, '%Y-%m-%d %H:%i:%s') due_date, 
                    case when s.id is null then 'Not Submitted' else 'Submitted' end as submission_status
                    from assignment a left join assignment_submit s on a.id = s.assignment_id and s.student_id = ?
                    where a.sub_code = ? and a.semester = ? order by a.id desc`,
                    [token.id, sub_code, semester]
                );
                const result = {
                    "assignment": assignment
                };
                return res.status(200).send(result);
            } else{
                const [assignment] = await db.promise().query(`select row_number() over (order by id) as id, title, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') start_date, DATE_FORMAT(due_date, '%Y-%m-%d %H:%i:%s') due_date
                    from assignment where sub_code = ? and semester = ? order by id desc`,
                    [sub_code, semester]
                );
                const result = {
                    "assignment": assignment
                };
                return res.status(201).send(result);
            }
        }
    }
    catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /assignment/{subjectID}/{semesterID}/{assignmentID}/update:
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
 *    summary: 과제 수정 or 제출한 과제 수정
 *    description: 과제 수정 or 제출한 과제 수정
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
 *        description: 학생일 때 제출한 과제 수정
 *      '201':
 *        description: 교수일 때 해당 과제 수정
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/:assignmentID/update', upload.array('files'), async (req, res) =>{
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
            const userid = token.id;
            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);

            if(token.author == 1){
                const assignment_submit_id = await assignment_function.select_assignment_submitid(assignment_id, userid);
                db.promise().query(`update assignment_submit set title=?, content=?, start_date = ?, due_date = ? where id=?`, [title, content, assignment_submit_id]);
                const [beforeFile] = await db.promise().query(`select file_name from assignment_submit_file where assignment_submit_id = ?`, [assignment_submit_id]);
                if(beforeFile.length > 0){
                    await db.promise().query(`delete from assignment_submit_file where assignment_submit_id=?;`, [assignment_submit_id]);
                }
                if(files){
                    const file_info = files.map(file => [file.originalname, file.buffer]);
                    const values = file_info.map(([name, data]) => [assignment_submit_id, name, data]);
                    db.promise().query(`insert into assignment_submit_file(assignment_submit_id, file_name, file_data) values ?;`,[values]);
                }
                return res.sendStatus(200);
            } else{
                const start_date = req.body.start_date;
                const due_date = req.body.due_date;
                db.promise().query(`update assignment set title=?, content=?, start_date = ?, due_date = ? where id=?`, [title, content, start_date, due_date, assignment_id]);
                const file_check = await assignment_function.select_assignmentfile(assignment_id);
                if(file_check){
                    await db.promise().query(`delete from assignment_file where assignment_id=?;`, [assignment_id]);
                }
                if(files.length > 0){
                    const file_info = files.map(file => [file.originalname, file.buffer]);
                    assignment_function.insert_assignmentfile(assignment_id, file_info);
                }
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

router.post('/:subjectID/:semesterID/:assignmentID/submit', upload.array('files'), async (req, res) =>{
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

            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);

            await db.promise().query(`insert into assignment_submit(assignment_id,student_id,title,content)
                values (?,?,?,?);`, [assignment_id,token.id,title,content]
            );
            if(files.length > 0){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [submit_id] = await db.promise().query(`select id from assignment_submit order by id desc limit 1;`,);
                const assignment_submit_id = submit_id[0].id;
                const values = file_info.map(([name, data]) => [assignment_submit_id, name, data]);
                db.promise().query(`insert into assignment_submit_file(assignment_submit_id, file_name, file_data) values ?;`,[values]);
            }
            return res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

router.post('/:subjectID/:semesterID/create', upload.array('files'), async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const title = req.body.title;
            const content = req.body.content;
            const start_date = req.body.start_date;
            const due_date = req.body.due_date;
            const files = req.files;
            await db.promise().query(`insert into 
                assignment(sub_code,semester,title,content,start_date,due_date)
                values (?,?,?,?,?,?);`,
                [sub_code,semester,title,content,start_date,due_date]
            );
            if(files.length > 0){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [assignmentid] = await db.promise().query(`select id from assignment order by id desc limit 1`);
                const assignment_id = assignmentid[0].id
                assignment_function.insert_assignmentfile(assignment_id, file_info);
            }
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;