const db = require('../config/db');

module.exports = {
    select_noticefile: async (notice_uniqueid) => {
        try{
            const [result] = await db.promise().query(`select file_name
                from notice_file where notice_id = ?`, [notice_uniqueid]
            );
            return result;
        }
        catch(err){
            throw err;
        }
    },
    select_notice: async (notice_uniqueid) =>{
        try{
            const [result] = await db.promise().query(`select sub_code,professor_name,title,content,writer,DATE_FORMAT(updated_time, '%Y-%m-%d %H:%i:%s') updated_time,view,semester
                from notice where id = ?`, [notice_uniqueid]
            );
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_noticeid: async (semester, sub_code, noticeid) =>{
        try{
            const [result] = await db.promise().query(`select id
                from notice where semester = ? and sub_code = ? order by id limit ?,1`,
                [semester,sub_code,noticeid]
            );
            const notice_uniqueid = result[0].id;
            return notice_uniqueid;
        }
        catch(err){
            throw err;
        }
    },
    insert_noticefile: async (notice_id, file_info) =>{
        try{
            const values = file_info.map(([name, data]) => [notice_id, name, data]);
            await db.promise().query(`insert into notice_file(notice_id, file_name, file_data) values ?;`,[values]);
        }
        catch(err){
            throw err;
        }
    },
    notice_info: async (notice, file) => {
        try{
            if(file.length > 0){
                const result = {
                    '공지사항 정보': notice,
                    '파일 정보': file
                };
                return result;
            }else{
                const result = {
                    '공지사항 정보': notice,
                };
                return result;
            }
        }
        catch(err){
            throw err;
        }
    }
}