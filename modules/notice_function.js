const db = require('../config/db');

module.exports = {
    select_noticefile: async (notice_uniqueid) => {
        try{
            const [result] = await db.promise().query(`select JSON_ARRAYAGG(file_name) file_name
                from notice_file where notice_id = ?`, [notice_uniqueid]
            );
            return result[0];
        }
        catch(err){
            throw err;
        }
    },
    select_notice: async (notice_uniqueid) =>{
        try{
            const [result] = await db.promise().query(`select content from notice where id = ?`, [notice_uniqueid]);
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
            if(file){
                const result = {
                    'notice': notice,
                    'file': file
                };
                return result;
            }else{
                const result = {
                    'notice': notice,
                };
                return result;
            }
        }
        catch(err){
            throw err;
        }
    }
}