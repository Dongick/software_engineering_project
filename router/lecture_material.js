const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('../modules/jwt');
const lecture_material_function = require('../modules/lecture_material_function')
const multer = require('multer');
const upload = multer();

/**
 * @openapi 
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}/delete:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 강의자료실 삭제
 *    description: 강의자료실 삭제
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '201':
 *        description: 강의자료실 삭제 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.get('/:subjectID/:semesterID/:lecture_materialID/delete', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const lecture_materialid = req.params.lecture_materialID - 1;
            const lecture_material_id = await lecture_material_function.select_lecture_materialid(semester, sub_code, lecture_materialid);
            db.promise().query(`delete from lecture_material where id = ?`, lecture_material_id);
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  get:
 *    summary: 강의자료실 번호 선택
 *    description: 해당하는 번호의 강의자료실 선택
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 강의자료실 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                강의자료실 정보:
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
 *        description: 교수일 때 해당 강의자료실 출력 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                강의자료실 정보:
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

router.get('/:subjectID/:semesterID/:lecture_materialID', async (req, res) => {
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const lecture_materialid = req.params.lecture_materialID - 1;
            const userid = token.id;
            const lecture_material_id = await lecture_material_function.select_lecture_materialid(semester, sub_code, lecture_materialid);
            const file = await lecture_material_function.select_lecture_materialfile(lecture_material_id);
            if(token.author == 1){
                const view_check = await db.promise().query(`select * from lecture_material_view where lecture_material_id = ? and student_id = ?`, [lecture_material_id, userid]);               
                if(view_check[0].length > 0){
                    const lecture_material = await lecture_material_function.select_lecture_material(lecture_material_id);
                    const result = await lecture_material_function.lecture_material_info(lecture_material, file);
                    return res.status(200).send(result);
                } else{
                    await db.promise().query(`update lecture_material set view = view + 1 where id = ?`,[lecture_material_id])
                    db.promise().query(`insert into lecture_material_view(lecture_material_id, student_id) values(?,?)`,[lecture_material_id,userid])
                    const lecture_material = await lecture_material_function.select_lecture_material(lecture_material_id);
                    const result = await lecture_material_function.lecture_material_info(lecture_material, file);
                    return res.status(200).send(result);
                }
            } else{
                const lecture_material = await lecture_material_function.select_lecture_material(lecture_material_id);
                const result = await lecture_material_function.lecture_material_info(lecture_material, file);
                return res.status(201).send(result);
            }
        }
    } catch(err){
        throw err;
    }
});

/**
 * @openapi
 * /lecture_material/{subjectID}/{semesterID}:
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
 *    summary: 해당 과목의 강의자료실 전체 조회
 *    description: 강의자료실 전체 조회
 *    security:
 *      - CookieAuth: []
 *    responses:
 *      '200':
 *        description: 학생일 때 해당 과목의 강의자료실 전체 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                lecture_material:
 *                  type: array
 *                  description: 강의자료실 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                        description: 강의자료실 번호
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
 *        description: 교수일 때 해당 강의자료실 전체 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                lecture_material:
 *                  type: array
 *                  description: 강의자료실 정보
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                        description: 강의자료실 번호
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
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            if(token.author == 1){
                const [lecture_material] = await db.promise().query(`select l.id, l.sub_code, l.professor_name, l.title, l.writer, DATE_FORMAT(l.created_time, '%Y-%m-%d %H:%i:%s') created_time, l.view, l.semester, JSON_ARRAYAGG(lf.file_name) AS file_names
                    from enrollment e join lecture_material l on e.sub_code = l.sub_code and e.semester = l.semester
                    join lecture_material_file lf on l.id = lf.lecture_mateiral_id where e.student_id = ? and e.semester = ? and e.sub_code = ?
                    group by n.id order by n.id`, [token.id, semester, sub_code]
                );

                const result = {
                    "lecture_material": lecture_material
                }
                return res.status(200).send(result);
            } else{
                const [lecture_material] = await db.promise().query(`select l.id, l.sub_code, l.professor_name, l.title, l.writer, DATE_FORMAT(l.created_time, '%Y-%m-%d %H:%i:%s') created_time, l.view, l.semester, JSON_ARRAYAGG(lf.file_name) AS file_names
                    from lecture_material l join lecture_material_file lf on l.id = lf.lecture_mateiral_id where l.semester = ? and l.sub_code = ? and l.professor_name = ?
                    group by n.id order by n.id`, [semester, sub_code, token.name]
                );

                const result = {
                    "lecture_material": lecture_material
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
 * /lecture_material/{subjectID}/{semesterID}/{lecture_materialID}/update:
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
 *    - name: lecture_materialID
 *      in: path
 *      required: true
 *      description: 강의자료실 번호
 *      schema:
 *        type: integer
 *  post:
 *    summary: 강의자료실 수정
 *    description: 강의자료실 수정
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
 *        description: 강의자료실 수정 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/:lecture_materialID/update', async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const lecture_materialid = req.params.lecture_materialID - 1;
            const title = req.body.title;
            const content = req.body.content;
            const files = req.files;
            const lecture_material_id = await lecture_material_function.select_lecture_materialid(semester,sub_code,lecture_materialid)
            db.promise().query(`update lecture_material set title=?, content=? where id=?`, [title, content, lecture_material_id]);
            const [file_check] = await lecture_material_function.select_lecture_materialfile(lecture_material_id);
            if(file_check.length > 0){
                await db.promise().query(`delete from lecture_material_file where lecture_material_id=?;`, [lecture_material_id]);
            }
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                lecture_material_function.insert_lecture_materialfile(lecture_material_id, file_info);
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
 * /lecture_material/{subjectID}/{semesterID}/create:
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
 *    summary: 강의자료실 생성
 *    description: 강의자료실 생성
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
 *        description: 강의자료실 생성 성공
 *      '401':
 *        description: 잘못된 access 토큰
 *      '419':
 *        description: access 토큰 만료
 */

router.post('/:subjectID/:semesterID/create', upload.array('files'), async (req, res) =>{
    try{
        const token = jwt.verify(req.cookies['accesstoken']);
        if (Number.isInteger(token)){
            return res.sendStatus(token);
        } else{
            const sub_code = req.params.subjectID;
            const semester = req.params.semesterID;
            const title = req.body.title;
            const content = req.body.content;
            const files = req.files;
            await db.promise().query(`insert into 
                lecture_material(sub_code,professor_name,title,content,writer,semester)
                values (?,?,?,?,?,?);`,
                [sub_code,token.name,title,content,token.name,semester]
            );
            if(files){
                const file_info = files.map(file => [file.originalname, file.buffer]);
                const [lecture_mateiralid] = await db.promise().query(`select id from lecture_material order by id desc limit 1;`,);
                const lecture_material_id = lecture_mateiralid[0].id
                lecture_material_function.insert_lecture_materialfile(lecture_material_id, file_info);
            }
            return res.sendStatus(201);
        }
    }
    catch(err){
        throw err;
    }
})



module.exports = router;