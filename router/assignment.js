const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const multer = require('multer');
const assignment_function = require('../modules/assignment_function');
const upload = multer();

/**
 * @openapi 
 * /assignment/{subjectID}/{semesterID}/{assignmentID}/{fileID}/{authorID}/download:
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
 *    - name: fileID
 *      in: path
 *      required: true
 *      description: 파일명
 *      schema:
 *        type: string
 *    - name: authorID
 *      in: path
 *      required: true
 *      description: 과제 OR 제출 파일 권한(과제 파일 -> 1, 제출 파일 -> 2)
 *      schema:
 *        type: integer
 *  get:
 *    summary: 파일 다운로드
 *    description: 해당 과제의 해당 파일 다운로드
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 파일 다운로드 성공
 *        content:
 *          application/octet-stream:
 *            schema:
 *              type: string
 *              format: binary
 *      '401':
 *        description: 잘못된 access 토큰
 *      '404':
 *        description: 파일이 존재하지 않음
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:assignmentID/:fileID/:authorID/download', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const assignmentid = req.params.assignmentID - 1;
            const file_name = req.params.fileID;
            const author = req.params.authorID;
            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);
            if(author == 1){
                const [file_data] = await db.promise().query(`select asf.file_data
                    from assignment_submit_file asf join assignment_submit asu on asf.assignment_submit_id = asu.id 
                    join assignment a on a.id = asu.assignment_id where asu.assignment_id = ? and asf.file_name = ?`, [assignment_id, file_name]
                );
                if(file_data.length > 0){
                    const fileData = file_data[0].file_data;
                    res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
                    res.setHeader('Content-Type', 'application/octet-stream');
    
                    return res.status(200).send(fileData);
                }
            } else if(author == 2){
                const [file_data] = await db.promise().query(`select file_data from assignment_file where assignment_id = ? and file_name = ?`, [assignment_id, file_name]);
                if(file_data.length > 0){
                    const fileData = file_data[0].file_data;
                    res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
                    res.setHeader('Content-Type', 'application/octet-stream');
    
                    return res.status(200).send(fileData);
                }
            }
        }
    }
    catch(err){
        throw err;
    }
})

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
                const assignment_submit_id = assignment_function.select_assignment_submitid(assignment_id, token.id);
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
 *                    content:
 *                      type: string
 *                      description: 과제 내용
 *                    file_name:
 *                      type: string
 *                      description: 과제 파일 이름
 *                assignment_submit:
 *                  type: object
 *                  properties:
 *                    title:
 *                      type: string
 *                      description: 과제 제출 제목
 *                    content:
 *                      type: string
 *                      description: 과제 제출 내용
 *                    file_name:
 *                      type: string
 *                      description: 과제 제출 파일 이름
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
 *                    content:
 *                      type: string
 *                      description: 과제 내용
 *                    file_name:
 *                      type: string
 *                      description: 과제 파일 이름
 *                assignment_submit_list:
 *                  type: array
 *                  description: 제출한 과제 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      student_id:
 *                        type: integer
 *                        description: 학번
 *                      student_name:
 *                        type: string
 *                        description: 학생 이름
 *                      title:
 *                        type: string
 *                        description: 과제 제출 제목
 *                      content:
 *                        type: string
 *                        description: 과제 제출 내용
 *                      file_name:
 *                        type: string
 *                        description: 제출 파일 이름
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
            const [assignment] = await db.promise().query(`select a.content, JSON_ARRAYAGG(af.file_name) as file_name
                from assignment a left join assignment_file af on a.id = af.assignment_id
                where a.id = ?`, [assignment_id]
            );
            result = {
                "assignment": assignment[0]
            };

            if(token.author == 1){
                const assignment_submit_id = await assignment_function.select_assignment_submitid(assignment_id, userid);
                console.log(assignment_submit_id);
                if(assignment_submit_id){
                    const [assignment_submit] = await db.promise().query(`select asu.title, asu.content, JSON_ARRAYAGG(asf.file_name) AS file_names
                        from assignment_submit asu left join assignment_submit_file asf on asu.id = asf.assignment_submit_id where asu.id = ?`, [assignment_submit_id]
                    );
                    result.assignment_submit = assignment_submit[0];
                }
                return res.status(200).send(result);
            } else{
                const [assignment_submit_list] = await db.promise().query(`select s.id student_id, s.name student_name, asu.title, asu.content, JSON_ARRAYAGG(asf.file_name) AS file_names
                    from studenttable s join assignment_submit asu on s.id = asu.student_id
                    left join assignment_submit_file asf on asu.id = asf.assignment_submit_id
                    where asu.assignment_id = ?
                    group by asu.id
                    `, [assignment_id]
                );
                if(assignment_submit_list.length > 0){
                    result.assignment_submit_list = assignment_submit_list;
                }
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
 *                  id:
 *                    type: integer
 *                    description: 과제 번호
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
 *                  id:
 *                    type: integer
 *                    description: 과제 번호
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
                    case when s.id is null then 'Not Submitted' else 'Submitted' end as submit_check
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
                db.promise().query(`update assignment_submit set title=?, content=? where id=?`, [title, content, assignment_submit_id]);
                const [beforeFile] = await db.promise().query(`select file_name from assignment_submit_file where assignment_submit_id = ?`, [assignment_submit_id]);
                if(beforeFile.length > 0){
                    await db.promise().query(`delete from assignment_submit_file where assignment_submit_id=?;`, [assignment_submit_id]);
                }
                if(files){
                    const file_info = files.map(file => [file.originalname, file.buffer]);
                    assignment_function.insert_assignment_submitfile(assignment_submit_id, file_info);
                }
                return res.sendStatus(200);
            } else{
                const start_date = req.body.start_date;
                const due_date = req.body.due_date;
                db.promise().query(`update assignment set title=?, content=?, start_date = ?, due_date = ? where id=?`, [title, content, start_date, due_date, assignment_id]);
                const [file_check] = await db.promise().query(`select JSON_ARRAYAGG(file_name) as file_name
                    from assignment_file where assignment_id = ?`, [assignment_id]
                );
                if(file_check.length > 0){
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
 * /assignment/{subjectID}/{semesterID}/{assignmentID}/submit:
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
            const userid = token.id;

            const assignment_id = await assignment_function.select_assignmentid(semester, sub_code, assignmentid);

            await db.promise().query(`insert into assignment_submit(assignment_id,student_id,title,content)
                values (?,?,?,?);`, [assignment_id,userid,title,content]
            );
            if(files.length > 0){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const assignment_submit_id = await assignment_function.select_assignment_submitid(assignment_id, userid);
                assignment_function.insert_assignment_submitfile(assignment_submit_id, file_info);
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
 *  post:
 *    summary: 과제 새성
 *    description: 해당 과목의 과제 생성
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
 *    responses:
 *      '201':
 *        description: 과제 생성 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

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