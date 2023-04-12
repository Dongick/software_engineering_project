const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const notice_function = require('../modules/notice_function')
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
            res.sendStatus(token);
        } else{
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;
            let noticeid = req.params.noticeID - 1;
            db.promise().query(`delete from notice where id = (select id from
            (select id from notice 
            where professor_name=? and semester=? and sub_code = ?
            order by id limit ?,1) tmp);`,
            [token.name, semester, sub_code, noticeid])
            res.sendStatus(200);
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
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: string
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '201':
 *        description: 교수일 때 해당 공지사항 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:noticeID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            const userid = token.id;
            if(token.author == 1){
                const [result] = await db.promise().query(`select n.id as id
                from enrollment e join notice n
                on e.sub_code = n.sub_code and e.semester = n.semester
                where e.student_id = ? and e.semester = ? and e.sub_code = ?
                order by n.id limit ?,1`,[userid, semester,sub_code,noticeid])
                const notice_uniqueid = result[0].id;
                const result2 = await db.promise().query(`select * from notice_view where notice_id = ? and user_id = ?`,
                [notice_uniqueid, userid])
                if(result2[0].length > 0){
                    const result3 = await notice_function.select_noticefile(notice_uniqueid);
                    if(result3.length > 0){
                        const file_info = result3.map(file => [file.file_name, file.file_data]);
                        const result4 = await notice_function.select_notice(notice_uniqueid);
                        const resultwithFile = {
                        ...result4,
                        file_name: file_info.map(file => file[0]),
                        file_data: file_info.map(file => file[1])
                        };
                        res.status(200).send(resultwithFile);
                    } else{
                        const result4 = await notice_function.select_notice(notice_uniqueid);
                        res.status(200).send(result4);
                    }
                } else{
                    db.promise().query(`update notice set view = view + 1 where id = ?`,[notice_uniqueid])
                    db.promise().query(`insert into notice_view(notice_id, user_id) values(?,?)`,[notice_uniqueid,userid])
                    const result3 = await notice_function.select_noticefile(notice_uniqueid);
                    if(result3.length > 0){
                        const file_info = result3.map(file => [file.file_name, file.file_data]);
                        const result4 = await notice_function.select_notice(notice_uniqueid);
                        const resultwithFile = {
                        ...result4,
                        file_name: file_info.map(file => file[0]),
                        file_data: file_info.map(file => file[1])
                        };
                        res.status(200).send(resultwithFile);
                    } else{
                        const result4 = await notice_function.select_notice(notice_uniqueid);
                        res.status(200).send(result4);
                    }
                }
            } else{
                const notice_uniqueid = await notice_function.select_noticeid(token.name, semester,sub_code,noticeid);
                const result3 = await notice_function.select_noticefile(notice_uniqueid);
                if(result3.length > 0){
                    const file_info = result3.map(file => [file.file_name, file.file_data]);
                    const result4 = await notice_function.select_notice(notice_uniqueid);
                    const resultwithFile = {
                    ...result4,
                    file_name: file_info.map(file => file[0]),
                    file_data: file_info.map(file => file[1])
                    };
                    res.status(201).send(resultwithFile);
                } else{
                    const result4 = await notice_function.select_notice(notice_uniqueid);
                    res.status(201).send(result4);
                }
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
 *    summary: 해당 과목의 공지사항 버튼 클릭
 *    description: 공지사항 버튼 클릭
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과목의 공지사항 버튼 클릭 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                content:
 *                  type: string
 *                  description: 본문
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                updated_time:
 *                  type: string
 *                  format: date-time
 *                  description: 업데이트 날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
 *      '201':
 *        description: 교수일 때 해당 공지사항 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: int
 *                  description: 공지사항 번호
 *                sub_code:
 *                  type: string
 *                  description: 과목코드
 *                professor_name:
 *                  type: string
 *                  description: 교수이름
 *                title:
 *                  type: string
 *                  description: 제목
 *                file_name:
 *                  type: string
 *                  description: 파일이름
 *                file_data:
 *                  type: byte
 *                  format: binary
 *                  description: 파일데이터
 *                writer:
 *                  type: string
 *                  description: 작성자
 *                created_time:
 *                  type: string
 *                  format: date-time
 *                  description: 생성날짜
 *                view:
 *                  type: integer
 *                  description: 조회수
 *                semester:
 *                  type: string
 *                  description: 년도-학기
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
                const [result] = await db.promise().query(`select n.id, n.sub_code, n.professor_name, n.title, n.writer, n.created_time, n.view, n.semester
                from enrollment e join notice n
                on e.sub_code = n.sub_code and e.semester = n.semester
                where e.student_id = ? and e.semester = ? and e.sub_code = ? order by n.id`,
                [token.id, semester,sub_code])
                res.status(200).send(result);
            } else{
                const [result] = await db.promise().query(`select id, sub_code, professor_name, title, writer, created_time, view, semester
                from notice where professor_name = ? and semester = ? and sub_code = ? order by id`,
                [token.name, semester,sub_code])
                res.status(201).send(result);
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
            const notice_id = await notice_function.select_noticeid(token.name, semester,sub_code,noticeid)
            db.promise().query(`update notice set title=?, content=? where id=?`, [title, content, notice_id]);
            const [result2] = await notice_function.select_noticefile(notice_id);
            if(result2.length > 0){
                await db.promise().query(`delete from notice_file where notice_id=?;`, [notice_id]);
            }
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                notice_function.insert_noticefile(notice_id, file_info);
            }
            res.sendStatus(200);
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
 *          encoding:
 *            files:
 *              contentType: multipart/form-data
 *    responses:
 *      '200':
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
            let sub_code = req.params.subjectID;
            let semester = req.params.semesterID;
            let title = req.body.title;
            let content = req.body.content;
            let files = req.files;
            await db.promise().query(`insert into 
            notice(sub_code,professor_name,title,content,writer,semester)
            values (?,?,?,?,?,?);`,
            [sub_code,token.name,title,content,token.name,semester])
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [result] = await db.promise().query(`select id from notice order by id desc limit 1;`,);
                const notice_id = result[0].id
                notice_function.insert_noticefile(notice_id, file_info);
            }
            res.sendStatus(200);
        }
    }
    catch(err){
        throw err;
    }
})

module.exports = router;