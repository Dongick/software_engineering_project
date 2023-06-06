const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const notice_function = require('../modules/notice_function');
const multer = require('multer');
const upload = multer();

router.get('/:subjectID/:semesterID/:noticeID/download', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
            
            return res.sendStatus(201);
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

router.get('/:subjectID/:semesterID/:noticeID/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const noticeid = req.params.noticeID - 1;
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
 *                공지사항 정보:
 *                  type: object
 *                  properties:
 *                    sub_code:
 *                      type: string
 *                      description: 과목코드
 *                    professor_name:
 *                      type: string
 *                      description: 교수이름
 *                    title:
 *                      type: string
 *                      description: 제목
 *                    content:
 *                      type: string
 *                      description: 본문
 *                    writer:
 *                      type: string
 *                      description: 작성자
 *                    updated_time:
 *                      type: string
 *                      format: date-time
 *                      description: 업데이트 날짜
 *                    view:
 *                      type: integer
 *                      description: 조회수
 *                    semester:
 *                      type: string
 *                      description: 년도-학기
 *                파일 정보:
 *                  type: array
 *                  description: 파일 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      file_name:
 *                        type: string
 *                        description: 파일이름
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
 *        description: 교수일 때 해당 공지사항 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                공지사항 정보:
 *                  type: object
 *                  properties:
 *                    sub_code:
 *                      type: string
 *                      description: 과목코드
 *                    professor_name:
 *                      type: string
 *                      description: 교수이름
 *                    title:
 *                      type: string
 *                      description: 제목
 *                    content:
 *                      type: string
 *                      description: 본문
 *                    writer:
 *                      type: string
 *                      description: 작성자
 *                    updated_time:
 *                      type: string
 *                      format: date-time
 *                      description: 업데이트 날짜
 *                    view:
 *                      type: integer
 *                      description: 조회수
 *                    semester:
 *                      type: string
 *                      description: 년도-학기
 *                파일 정보:
 *                  type: array
 *                  description: 파일 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      file_name:
 *                        type: string
 *                        description: 파일이름
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
                const view_check = await db.promise().query(`select * from notice_view where notice_id = ? and student_id = ?`, [notice_id, userid]);
                if(view_check[0].length > 0){
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
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      professor_name:
 *                        type: string
 *                        description: 교수이름
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      content:
 *                        type: string
 *                        description: 본문
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
 *                      semester:
 *                        type: string
 *                        description: 년도-학기
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
 *                      sub_code:
 *                        type: string
 *                        description: 과목코드
 *                      professor_name:
 *                        type: string
 *                        description: 교수이름
 *                      title:
 *                        type: string
 *                        description: 제목
 *                      content:
 *                        type: string
 *                        description: 본문
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
 *                      semester:
 *                        type: string
 *                        description: 년도-학기
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
                const [notice] = await db.promise().query(`select n.id, n.sub_code, n.professor_name, n.title, n.writer, DATE_FORMAT(n.created_time, '%Y-%m-%d %H:%i:%s') created_time, n.view, n.semester, JSON_ARRAYAGG(nf.file_name) AS file_names
                    from enrollment e join notice n on e.sub_code = n.sub_code and e.semester = n.semester
                    join notice_file nf on n.id = nf.notice_id where e.student_id = ? and e.semester = ? and e.sub_code = ?
                    group by n.id order by n.id`, [token.id, semester, sub_code]
                );

                const result = {
                    "notice": notice
                }
                return res.status(200).send(result);
            } else{
                const [notice] = await db.promise().query(`select n.id, n.sub_code, n.professor_name, n.title, n.writer, DATE_FORMAT(n.created_time, '%Y-%m-%d %H:%i:%s') created_time, n.view, n.semester, JSON_ARRAYAGG(nf.file_name) AS file_names
                    from notice n join notice_file nf on n.id = nf.notice_id where n.semester = ? and n.sub_code = ? and n.professor_name = ?
                    group by n.id order by n.id`, [semester, sub_code, token.name]
                );
                const result = {
                    "notice": notice
                }
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

router.post('/:subjectID/:semesterID/:noticeID/update', upload.array('files'), async (req, res) =>{
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
            const [file_check] = await notice_function.select_noticefile(notice_id);
            if(file_check.length > 0){
                await db.promise().query(`delete from notice_file where notice_id=?`, [notice_id]);
            }
            if(files){
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
            if(files){
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