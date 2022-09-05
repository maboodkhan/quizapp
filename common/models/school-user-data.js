'use strict';

module.exports = function (Schooluserdata) {

    Schooluserdata.showEditUsersData = function (data, cb) {
        let msg = {};
        let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
        if (id == undefined) {
            msg.status = false;
            msg.message = "Please provide the id";
            return cb(null, msg);
        }

        Schooluserdata.findOne({
            where: { id: id },
            include: [
                {
                    relation: 'userDataSchool',
                    scope: {
                        // where: {
                        //     status: 0
                        // }
                    }
                },
                {
                    relation: 'quiz_user_data',
                    scope: {
                        where: { status: 1 }
                    }
                }
            ]
        }, function (err, result) {
            if (err) { return cb(null, err); }

            result = JSON.parse(JSON.stringify(result));
            if (!result) {
                msg.status = false;
                msg.message = "User not found.";
                return cb(null, msg);
            }
            let school_id = [];
            let class_id = [];
            let section_id = [];
            let subject_id = [];
            result.userDataSchool.forEach(element => {
                school_id.push(element.school_id);
                class_id.push(element.class_id);
                section_id.push(element.section_id);
                subject_id.push(element.subject_id);
            });
            school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
            class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
            section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
            subject_id = subject_id.filter((v, i, a) => a.indexOf(v) === i);
            delete result.userDataSchool;
            result.school_id = school_id;
            result.class_id = class_id;
            result.section_id = section_id;
            result.subject_id = subject_id;
            // console.log(result);
            msg.status = true;
            msg.data = result;
            return cb(null, msg);

        });
    }

    Schooluserdata.remoteMethod(
        'showEditUsersData',
        {
            http: { path: '/showEditUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Schooluserdata.showUsersData = function (data, cb) {
        // console.log(data);
        let msg = {};
        let cond = '';
        let subjectCond = {};
        let studentName = (data.studentName == undefined || data.studentName == null || data.studentName == '') ? undefined : data.studentName;
        let rollNumber = (data.rollNumber == undefined || data.rollNumber == null || data.rollNumber == '') ? undefined : data.rollNumber;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let studentContactNo = (data.studentContactNo == undefined || data.studentContactNo == null || data.studentContactNo == '') ? undefined : data.studentContactNo;
        let user_type = (data.user_type == undefined || data.user_type == null || data.user_type == '') ? undefined : data.user_type;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        
        let user_id = (data.user_id == undefined || data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        // cond = {
        //     studentName: studentName,
        //     rollNumber: rollNumber,
        //     email: email,
        //     studentContactNo: studentContactNo,
        //     user_type: user_type
        // };
        if (studentName != undefined) {
            cond = cond + " and ( sud.studentName like '%"+ studentName +"%')";
            // cond = cond + " and suc.studentName = " + studentName;
        }
        if (rollNumber != undefined) {
            cond = cond + " and sud.rollNumber = " + rollNumber;
        }
        if (email != undefined) {
            cond = cond + " and ( sud.email like '%"+ email +"%')";
            // cond = cond + " and suc.email = " + email;
        }
        if (studentContactNo != undefined) {
            cond = cond + " and ( sud.studentContactNo like '%"+ studentContactNo +"%')";
        }
        if (user_type != undefined) {
            cond = cond + " and sud.user_type = " + user_type;
        }
        if (school_id != undefined) {
            cond = cond + " and suc.school_id IN(" + school_id.join() + ")";
        }
        if (class_id !== undefined) {
            cond = cond + " and suc.class_id IN(" + class_id.join() + ")";
        }

        if (section_id !== undefined) {
            cond = cond + " and suc.section_id IN(" + section_id.join() + ")";
        }

        if (subject_id != undefined) {
            cond = cond + " and suc.subject_id IN(" + subject_id.join() + ")";
        }

        if(status != undefined){
            cond = cond + " and sud.status = " + status;
        }
        // console.log(cond);
        var ds = Schooluserdata.dataSource;
        let params;
        // sud.studentName =  ${studentName} and sud.rollNumber = ${rollNumber}
        // sud.email = ${email} and sud.studentContactNo = ${studentContactNo}
        // sud.user_type = ${user_type}

        var countSql = `SELECT sud.*, sch.school_name, c.class_name, s.section_name
        FROM school_user_data sud
        left join school_user_classes suc on sud.id = suc.school_data_id
        left join schools sch on suc.school_id = sch.id
        left join classes c on suc.class_id = c.id
        left join class_sections cs on suc.section_id = cs.id
        left join sections s on cs.section_id = s.id
        where 1=1 and suc.status=1 ${cond} group by sud.email`;

        var sql = `SELECT sud.*, sch.school_name, c.class_name, s.section_name
        FROM school_user_data sud
        left join school_user_classes suc on sud.id = suc.school_data_id
        left join schools sch on suc.school_id = sch.id
        left join classes c on suc.class_id = c.id
        left join class_sections cs on suc.section_id = cs.id
        left join sections s on cs.section_id = s.id
        where 1=1 and suc.status=1 ${cond} group by sud.email LIMIT ${offset},${limit}`;
        // console.log(sql);
        ds.connector.query(countSql, params, function (err, total_students) {

            ds.connector.query(sql, params, function (err, res) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return (null, msg)
                }
     
                let countVal = 0;
                if (total_students.length > 0) {
                    countVal = total_students.length;
                }
                // console.log(countVal);
                // console.log(res);
                msg.status = true;
                msg.data = res;
                msg.totalCount = countVal;
                // console.log(msg);
                return cb(null, msg);
            });
        });
    }

    Schooluserdata.remoteMethod(
        'showUsersData',
        {
            http: { path: '/showUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
};
