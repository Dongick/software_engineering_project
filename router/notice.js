const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const notice_function = require('../modules/notice_function');
const multer = require('multer');
const upload = multer();

/**
 * @openapi 
 * /notice/{subjectID}/{semesterID}/{noticeID}/{fileID}/download:
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
 *    - name: fileID
 *      in: path
 *      required: true
 *      description: 파일명
 *      schema:
 *        type: string
 *  get:
 *    summary: 파일 다운로드
 *    description: 해당 공지사항의 해당 파일 다운로드
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

router.get('/:subjectID/:semesterID/:noticeID/:fileID/download', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            const file_name = req.params.fileID;
            const notice_id = await notice_function.select_noticeid(semester, sub_code, noticeid);
            const [file_data] = await db.promise().query(`select file_data from notice_file where notice_id = ? and file_name = ?`, [notice_id, file_name]);
            if(file_data.length > 0){
                const fileData = file_data[0].file_data;
                res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
                res.setHeader('Content-Type', 'application/octet-stream');

                return res.status(200).send(fileData);
            } else{
                return res.sendStatus(404);
            }
        }
    }
    catch(err){
        throw err;
    }
})

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
 *      '201':
 *        description: 공지사항 삭제 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.delete('/:subjectID/:semesterID/:noticeID/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            console.log(sub_code, semester, noticeid);
            const notice_id = await notice_function.select_noticeid(semester, sub_code, noticeid);
            db.promise().query(`delete from notice where id = ?`, [notice_id]);
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /notice/{subjectID}/{semesterID}/{noticeID}:
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
 *    summary: 공지사항 번호 선택
 *    description: 해당하는 번호의 공지사항 선택
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 공지사항 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                notice:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      description: 본문
 *                file:
 *                  type: object
 *                  properties:
 *                    file_name:
 *                      type: array
 *                      items:
 *                        type: string
 *                      description: 파일 이름
 *      '201':
 *        description: 교수일 때 해당 공지사항 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                notice:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      description: 본문
 *                file:
 *                  type: object
 *                  properties:
 *                    file_name:
 *                      type: array
 *                      items:
 *                        type: string
 *                      description: 파일 이름
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:noticeID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            const userid = token.id;
            const notice_id = await notice_function.select_noticeid(semester, sub_code, noticeid);
            const file = await notice_function.select_noticefile(notice_id);
            if(token.author == 1){
                const [view_check] = await db.promise().query(`select id from notice_view where notice_id = ? and student_id = ?`, [notice_id, userid]);
                if(view_check.length > 0){
                    const notice = await notice_function.select_notice(notice_id);
                    const result = await notice_function.notice_info(notice, file);
                    return res.status(200).send(result);
                } else{
                    await db.promise().query(`update notice set view = view + 1 where id = ?`,[notice_id]);
                    db.promise().query(`insert into notice_view(notice_id, student_id) values(?,?)`,[notice_id,userid]);
                    const notice = await notice_function.select_notice(notice_id);
                    const result = await notice_function.notice_info(notice, file);
                    return res.status(200).send(result);
                }
            } else{
                const notice = await notice_function.select_notice(notice_id);
                const result = await notice_function.notice_info(notice, file);
                return res.status(201).send(result);
            }
        }
    } catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /notice/{subjectID}/{semesterID}:
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
 *    summary: 해당 과목의 공지사항 전체 조회
 *    description: 공지사항 전체 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과목의 공지사항 전체 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                notice:
 *                  type: array
 *                  description: 공지사항 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                        description: 공지사항 번호
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      writer:
 *                        type: string
 *                        description: 작성자
 *                      updated_time:
 *                        type: string
 *                        format: date-time
 *                        description: 생성 날짜
 *                      view:
 *                        type: integer
 *                        description: 조회수
 *                      file_name:
 *                        type: array
 *                        items:
 *                          type: string
 *                        description: 파일명
 *      '201':
 *        description: 교수일 때 해당 과목의 공지사항 전체 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                notice:
 *                  type: array
 *                  description: 공지사항 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                        description: 공지사항 번호
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      writer:
 *                        type: string
 *                        description: 작성자
 *                      updated_time:
 *                        type: string
 *                        format: date-time
 *                        description: 생성 날짜
 *                      view:
 *                        type: integer
 *                        description: 조회수
 *                      file_name:
 *                        type: array
 *                        items:
 *                          type: string
 *                        description: 파일명
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
                const [notice] = await db.promise().query(`select row_number() over (order by n.updated_time) as id, n.title, n.writer, DATE_FORMAT(n.updated_time, '%Y-%m-%d') updated_time, n.view, JSON_ARRAYAGG(nf.file_name) AS file_names
                    from notice n left join notice_file nf on n.id = nf.notice_id
                    join enrollment e on e.sub_code = n.sub_code and e.semester = n.semester
                    where e.student_id = ? and e.semester = ? and e.sub_code = ?
                    group by n.id order by n.updated_time desc`, [token.id, semester, sub_code]
                );
                const result = {
                    "notice": notice
                };
                return res.status(200).send(result);
            } else{
                const [notice] = await db.promise().query(`select row_number() over (order by n.updated_time) as id, n.title, n.writer, DATE_FORMAT(n.updated_time, '%Y-%m-%d') updated_time, n.view, JSON_ARRAYAGG(nf.file_name) AS file_names
                    from notice n left join notice_file nf on n.id = nf.notice_id where n.semester = ? and n.sub_code = ? and n.professor_name = ?
                    group by n.id order by n.updated_time desc`, [semester, sub_code, token.name]
                );
                const result = {
                    "notice": notice
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
 *      '201':
 *        description: 공지사항 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.put('/:subjectID/:semesterID/:noticeID/update', upload.array('files'), async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            const title = req.body.title;
            const content = req.body.content;
            const files = req.files;
            const notice_id = await notice_function.select_noticeid(semester,sub_code,noticeid);
            db.promise().query(`update notice set title=?, content=? where id=?`, [title, content, notice_id]);
            const file_check = await notice_function.select_noticefile(notice_id);
            if(file_check){
                await db.promise().query(`delete from notice_file where notice_id=?`, [notice_id]);
            }
            if(files.length > 0){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                notice_function.insert_noticefile(notice_id, file_info);
            }
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /notice/{subjectID}/{semesterID}/create:
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
 *    summary: 공지사항 생성
 *    description: 공지사항 생성
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
 *      '201':
 *        description: 공지사항 생성 성공
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
            const files = req.files;

            await db.promise().query(`insert into 
                notice(sub_code,professor_name,title,content,writer,semester)
                values (?,?,?,?,?,?);`,
                [sub_code,token.name,title,content,token.name,semester]
            );
            if(files.length > 0){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [noticeid] = await db.promise().query(`select id from notice order by id desc limit 1`);
                const notice_id = noticeid[0].id
                notice_function.insert_noticefile(notice_id, file_info);
            }
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;