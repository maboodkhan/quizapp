'use strict';

module.exports = function (Attendance) {

    Attendance.addAttendance = function (data, cb) {
        let msg = {};
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' ? undefined : data.studentUserId);
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
        let attendance_type = (data.attendance_type == undefined || data.attendance_type == null || data.attendance_type == '' ? undefined : data.attendance_type.toUpperCase());

        if (studentUserId == undefined) {
            msg = { status: false, message: "Please provide student user id." };
            return cb(null, msg);
        }

        if (takenBy == undefined) {
            msg = { status: false, message: "Please provide teacher user id." };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id." };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id." };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id." };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id." };
            return cb(null, msg);
        }

        if (attendance_type == undefined) {
            msg = { status: false, message: "Please provide attendance type." };
            return cb(null, msg);
        }

        var today = new Date();
        let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let currentTime = date + " " + time;
        let attendanceDate = date;

        let attendanceObj = {
            studentUserId: studentUserId,
            takenBy: takenBy,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            attendanceDate: attendanceDate,
            takenBy: takenBy
        }

        if (attendance_type == "START") {
            attendanceObj.startTime = currentTime;
        } else if (attendance_type == "END") {
            attendanceObj.endTime = currentTime;
        } else if (attendance_type == "BOTH") {
            attendanceObj.startTime = currentTime;
            attendanceObj.endTime = currentTime;
        }

        Attendance.upsertWithWhere({
            studentUserId: studentUserId,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            attendanceDate: attendanceDate,
            takenBy: takenBy
        }, attendanceObj, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, message: "Attendance added successfully.", data: result };
            return cb(null, msg);
        })
    }

    Attendance.remoteMethod(
        'addAttendance',
        {
            http: { path: '/addAttendance', verb: 'post' },
            description: 'add attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Attendance.getAttendance = function (data, cb) {
        let msg = {};
        // console.log(data);
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' ? undefined : data.studentUserId);
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let attendanceDate = (data.attendanceDate == undefined || data.attendanceDate == null || data.attendanceDate == '' ? undefined : data.attendanceDate);
        let fromDate = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let toDate = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        if (takenBy == undefined) {
            msg = { status: false, message: "Please provide teacher user id." };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id." };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id." };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id." };
            return cb(null, msg);
        }

        if (fromDate !== undefined) {
            //let frmDate = new Date(fromDate);
            let frmDate = dateFormatter(fromDate);
            frmDate = new Date(frmDate);
            fromDate = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (toDate !== undefined) {
            //let tDate = new Date(toDate);
            let tDate = dateFormatter(toDate);
            tDate = new Date(tDate);
            toDate = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
        }

        var today = dateFormatter(new Date());
        today = new Date(today);
        let dateCond = {};
        if (fromDate !== undefined && toDate !== undefined) {
            dateCond = { between: [fromDate, toDate] };
        } else if (fromDate !== undefined && toDate == undefined) {
            // fromDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 00:00:00";
            toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
            dateCond = { between: [fromDate, toDate] };
        } else if (fromDate == undefined && toDate !== undefined) {
            // fromDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 00:00:00";
            // toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
            dateCond = { lte: toDate };
        } else {
            fromDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 00:00:00";
            toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
            dateCond = { between: [fromDate, toDate] };
        }

        if (attendanceDate == undefined) {
            //var today = new Date();
            attendanceDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 00:00:00";
            // toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
        }

        let cond = {}
        if (studentUserId !== undefined) {
            cond = { studentUserId: { inq: studentUserId } };
        }

        let takenCond = {}
        if (studentUserId !== undefined) {
            takenCond = { takenBy: takenBy };
        }

        let subjectCond = {}
        if (subject_id !== undefined) {
            subjectCond = { subject_id: { inq: subject_id } };
        }
        // console.log(dateCond);
        Attendance.find({
            where: {
                school_id: { inq: school_id },
                class_id: { inq: class_id },
                section_id: { inq: section_id },
                // attendanceDate: attendanceDate,
                takenBy: takenBy,
                startTime: dateCond,
                and: [cond, subjectCond]
            },
            limit: limit,
            skip: offset,
            order: "id desc",
            include: [{
                relation: "studentusers",
                scope: {
                    fields: ['firstName', 'lastName', 'email']
                }
            }]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Attendance.remoteMethod(
        'getAttendance',
        {
            http: { path: '/getAttendance', verb: 'post' },
            description: 'add attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attendance.getStudentAttendance = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' ? undefined : data.studentUserId);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let fromDate = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let toDate = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = {};

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }
        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }
        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }
        if (studentUserId != undefined) {
            if(Array.isArray(studentUserId)){
                cond.studentUserId = { inq: studentUserId }
            } else {
                cond.studentUserId = studentUserId;
            }
        }else{
            cond.studentUserId = {gte: -1};
        }
        
        if (subject_id != undefined) {
            cond.subject_id = { inq: subject_id }
        }

        if (fromDate !== undefined) {
            let frmDate = dateFormatter(fromDate);
            frmDate = new Date(frmDate);
            fromDate = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (toDate !== undefined) {
            let tDate = dateFormatter(toDate);
            tDate = new Date(tDate);
            toDate = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
        }

        var today = dateFormatter(new Date());
        today = new Date(today);
        let dateCond = {};
        if (fromDate !== undefined && toDate !== undefined) {
            dateCond = { between: [fromDate, toDate] };
            cond.attendanceDate = dateCond
        } else if (fromDate !== undefined && toDate == undefined) {
            toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
            dateCond = { between: [fromDate, toDate] };
            cond.attendanceDate = dateCond
        } else if (fromDate == undefined && toDate !== undefined) {
            dateCond = { lte: toDate };
            cond.attendanceDate = dateCond
        }
        // cond.studentUserId = {gte: -1};
        // console.log(cond);
        Attendance.find({ where: cond }, function (err, count) {
            if (err) {
                return cb(null, err);
            }
            Attendance.find({
                where: cond,
                limit: limit,
                skip: offset,
                order: "id desc",
                include: [
                    {
                        relation: "studentusers",
                        scope: {
                            fields: ['firstName', 'lastName', 'email']
                        }
                    },
                    {
                        relation: 'class',
                        scope: {
                            fields: ['class_name'],
                        }
                    },
                    {
                        relation: 'classSection',
                        scope: {
                            fields: ['section_id'],
                            include: [
                                {
                                    relation: 'class_section',
                                    scope: {
                                        fields: ['section_name'],
                                    }
                                }
                            ]
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    },
                    {
                        relation: "onlineSchedule",
                        scope: {
                            fields: ['id', 'user_id', 'start_date', 'end_date'],
                            include: [
                                {
                                    relation: 'zoomClass',
                                    scope: {}
                                }
                            ]
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, totalCount: count.length };
                return cb(null, msg);
            });
        });

    }

    Attendance.remoteMethod(
        'getStudentAttendance',
        {
            http: { path: '/getStudentAttendance', verb: 'post' },
            description: 'Get student attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attendance.addClassAttendance = async function (data, cb) {
        let msg = {};
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' || data.studentUserId.length < 1 ? undefined : data.studentUserId);
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);

        // if (studentUserId == undefined) {
        //     msg = { status: false, message: "Please provide student user id." };
        //     return cb(null, msg);
        // }

        if (takenBy == undefined) {
            msg = { status: false, message: "Please provide teacher user id." };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id." };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id." };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id." };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id." };
            return cb(null, msg);
        }

        try {
            let students = await getClassStudents(school_id, class_id, section_id);
            let addStuAttendance = await addStudents(data, students, studentUserId);
            // let updStudenAttendance = await updateAttendance(studentUserId, data);            
            msg.status = true;
            msg.message = "Attendance marked successfully.";
            return msg;
        } catch (error) {
            msg.status = true;
            msg.message = error;
            return msg;
        }

    }

    Attendance.remoteMethod(
        'addClassAttendance',
        {
            http: { path: '/addClassAttendance', verb: 'post' },
            description: 'add class attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getClassStudents = (school_id, class_id, section_id) => {
        return new Promise((resolve, reject) => {
            let UserClass = Attendance.app.models.user_classes;

            UserClass.find({
                where: {
                    school_id: school_id,
                    class_id: class_id,
                    section_id: section_id
                },
                include: [
                    {
                        relation: "users",
                        scope: {
                            where: {
                                status: 1,
                                user_type_id: 4
                            },
                            fields: ["firstName", "lastName", "email", "contactNumber"]
                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    reject(err.message);
                }
                resolve(result);
            });
        });
    }

    let addStudents = (data, studentData, studentUserId) => {
        return new Promise((resolve, reject) => {

            let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
            let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
            let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
            let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
            let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
            let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
            var today = new Date();
            let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let currentTime = date + " " + time;
            let attendanceDate = date;
            let incVal = 0;
            // console.log(studentData);
            studentData.forEach((stuVal) => {
                incVal++;
                if (stuVal.toJSON().users) {
                    let studentId = stuVal.toJSON().users.id;
                    let attendancceStatus = 'P';
                    if (studentUserId !== undefined) {
                        if (studentUserId.includes(studentId)) {
                            attendancceStatus = 'A';
                        }
                    }
                    let attendanceObj = {
                        studentUserId: studentId,
                        takenBy: takenBy,
                        school_id: school_id,
                        class_id: class_id,
                        section_id: section_id,
                        subject_id: subject_id,
                        schedule_id: schedule_id,
                        attendanceDate: attendanceDate,
                        takenBy: takenBy,
                        startTime: currentTime,
                        endTime: currentTime,
                        attendanceStatus: attendancceStatus,
                        offlineAttendance: 1
                    };

                    Attendance.upsertWithWhere({
                        studentUserId: studentId,
                        school_id: school_id,
                        class_id: class_id,
                        section_id: section_id,
                        subject_id: subject_id,
                        schedule_id: schedule_id,
                        attendanceDate: attendanceDate,
                        takenBy: takenBy
                    }, attendanceObj, function (err, result) {
                        if (err) {
                            console.log(err);
                            reject(err.message)
                        }
                        // msg = { status: true, message: "Attendance taken successfully.", data: result };
                        // return cb(null, msg);
                    });
                }
            });
            if (incVal == studentData.length) {
                resolve(true);
            }
        });
    }

    let updateAttendance = (userIds, data) => {
        return new Promise((resolve, reject) => {
            let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
            let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
            let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
            let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
            let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
            var today = new Date();
            let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let currentTime = date + " " + time;
            let attendanceDate = date;

            if (userIds == undefined) {
                resolve(false);
            } else {

                Attendance.update({
                    studentUserId: { inq: userIds },
                    school_id: school_id,
                    class_id: class_id,
                    section_id: section_id,
                    subject_id: subject_id,
                    attendanceDate: attendanceDate,
                    takenBy: takenBy
                },
                    {
                        attendanceStatus: 'A'
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                            reject(err.message)
                        }
                        resolve(result);
                    });
            }
        });
    }


    Attendance.getAttendanceList = function (data, cb) {
        let msg = {};
        let studentName = (data.studentName == undefined || data.studentName == null || data.studentName == '') ? undefined : data.studentName;
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let attendanceDate = (data.attendanceDate == undefined || data.attendanceDate == null || data.attendanceDate == '' ? undefined : data.attendanceDate);
        let fromDate = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let toDate = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Attendance.dataSource;
        let cond = '';
        let params;

        if (takenBy != undefined) {
            cond = cond + " and ans.takenBy = " + takenBy
        }

        /*if (fromDate != undefined) {
            let from_Date = new Date(fromDate);
            fromDate = from_Date.getFullYear() + "-" + (from_Date.getMonth() + 1) + "-" + from_Date.getDate()
        }
        if (toDate != undefined) {
            let to_Date = new Date(toDate);
            toDate = to_Date.getFullYear() + "-" + (to_Date.getMonth() + 1) + "-" + to_Date.getDate()
        }*/

        if (fromDate !== undefined) {
            //let frmDate = new Date(fromDate);
            let frmDate = dateFormatter(fromDate);
            frmDate = new Date(frmDate);
            fromDate = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (toDate !== undefined) {
            //let tDate = new Date(toDate);
            let tDate = dateFormatter(toDate);
            tDate = new Date(tDate);
            toDate = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
        }

        if (studentName != undefined) {
            cond = cond + " and ( qu.firstName like '%" + studentName + "%' or  qu.lastName like '%" + studentName + "%')";
        }

        if (school_id !== undefined) {
            cond = cond + " and ans.school_id IN(" + school_id.join() + ")";
        }

        if (class_id !== undefined) {
            cond = cond + " and ans.class_id IN(" + class_id.join() + ")";
        }

        if (section_id !== undefined) {
            cond = cond + " and ans.section_id IN(" + section_id.join() + ")";
        }

        if (subject_id !== undefined) {
            cond = cond + " and ans.subject_id IN(" + subject_id.join() + ")";
        }

        if (schedule_id != undefined) {
            cond = cond + " and ans.schedule_id = " + schedule_id
        }

        if (schedule_id == undefined) {
            //var today = new Date();
            var today = dateFormatter(new Date());
            today = new Date(today);
            let dateCond = {};
            if (fromDate !== undefined && toDate !== undefined) {
                cond = cond + " and ans.attendanceDate >= '" + fromDate + "'"
                cond = cond + " and ans.attendanceDate <= '" + toDate + "'"
                // dateCond = { gte: fromDate, lte: toDate };
            } else if (fromDate !== undefined && toDate == undefined) {
                toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
                cond = cond + " and ans.attendanceDate >= '" + fromDate + "'"
                cond = cond + " and ans.attendanceDate <= '" + toDate + "'"
                // dateCond = { gte: fromDate, lte: toDate };
            } else if (fromDate == undefined && toDate !== undefined) {
                cond = cond + " and ans.attendanceDate <= '" + toDate + "'"
                // dateCond = { lte: toDate };
            } else {
                fromDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
                toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
                cond = cond + " and ans.attendanceDate >= '" + fromDate + "'"
                cond = cond + " and ans.attendanceDate <= '" + toDate + "'"
                // dateCond = { gte: fromDate, lte: toDate };
            }
        }

        var countSql = `SELECT ans.*, qu.firstName, qu.lastName, qu.email
        FROM attendance ans
        join quiz_user qu ON qu.id = ans.studentUserId
        where 1=1 ${cond}`

        var sql = `SELECT ans.*, qu.firstName, qu.lastName, qu.email, c.class_name, 
        s.section_name, sub.subject_name
        FROM attendance ans
        join quiz_user qu ON qu.id = ans.studentUserId
        join classes c on ans.class_id = c.id
        join class_sections cs on ans.section_id = cs.id
        join sections s on cs.section_id = s.id
        JOIN subjects sub on sub.id = ans.subject_id
        where 1=1 ${cond}
        ORDER BY ans.id DESC
        LIMIT ${offset},${limit};`
        // console.log(sql);
        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: result, totalCount: count.length };
                return cb(null, msg);
            });
        });
    }

    Attendance.remoteMethod(
        'getAttendanceList',
        {
            http: { path: '/getAttendanceList', verb: 'post' },
            description: 'add attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attendance.getUserAttendance = function (data, cb) {
        let msg = {};
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let attendanceDate = (data.attendanceDate == undefined || data.attendanceDate == null || data.attendanceDate == '' ? undefined : data.attendanceDate);
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' ? undefined : data.studentUserId);
        let attendanceId = (data.attendanceId == undefined || data.attendanceId == null || data.attendanceId == '' ? undefined : data.attendanceId);

        // if (takenBy == undefined) {
        //     msg = { status: false, message: "Please provide teacher user id." };
        //     return cb(null, msg);
        // }

        if (attendanceDate != undefined) {
            attendanceDate = attendanceDate.slice(0, 10);
        }

        Attendance.findOne({
            where: {
                id: attendanceId,
                attendanceDate: attendanceDate,
                takenBy: takenBy,
            },
            include: [
                {
                    relation: "studentusers",
                    scope: {
                        fields: ['firstName', 'lastName', 'email']
                    }
                },
                {
                    relation: "class",
                    scope: {
                        fields: ['class_name']
                    }
                },
                {
                    relation: "classSection",
                    scope: {
                        fields: ['id', 'section_id'],
                        include: [
                            {
                                relation: 'class_section',
                                scope: {
                                    fields: ['section_name']
                                }
                            }
                        ]
                    }
                },
                {
                    relation: "subject",
                    scope: {
                        fields: ['subject_name']
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Attendance.remoteMethod(
        'getUserAttendance',
        {
            http: { path: '/getUserAttendance', verb: 'post' },
            description: 'add attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Attendance.endAttendance = function (data, cb) {
        let msg = {};
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
        let attendance_type = (data.attendance_type == undefined || data.attendance_type == null || data.attendance_type == '' ? undefined : data.attendance_type.toUpperCase());

        if (takenBy == undefined) {
            msg = { status: false, message: "Please provide teacher user id." };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id." };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id." };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id." };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id." };
            return cb(null, msg);
        }

        if (attendance_type == undefined) {
            msg = { status: false, message: "Please provide attendance type." };
            return cb(null, msg);
        }

        var today = new Date();
        let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let currentTime = date + " " + time;
        let attendanceDate = date;

        let attendanceObj = {};
        if (attendance_type !== "END") {
            msg.status = false;
            msg.message = "Attendance type mismatch";
        } else {
            attendanceObj.endTime = currentTime;
            attendanceObj.schedule_id = schedule_id;
        }
        Attendance.update({
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            attendanceDate: attendanceDate,
            takenBy: takenBy,
            endTime: null
        }, attendanceObj, function (err, result) {
            if (err) {
                console.log(err)
                return cb(null, err);
            }
            msg = { status: true, message: "Attendance updated successfully." };
            return cb(null, msg);
        })
    }

    Attendance.remoteMethod(
        'endAttendance',
        {
            http: { path: '/endAttendance', verb: 'post' },
            description: 'End class attendancce',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let dateFormatter = (dt) => {
        var options = {
            timeZone: "Asia/Kolkata",
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        };

        var formatter = new Intl.DateTimeFormat([], options);
        var dateTime = formatter.format(new Date(dt));
        return dateTime;
    }
};


// if (fromDate !== undefined) {
//     let frmDate = dateFormatter(fromDate);
//     frmDate = new Date(frmDate);
//     fromDate = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
// }

// if (toDate !== undefined) {
//     let tDate = dateFormatter(toDate);
//     tDate = new Date(tDate);
//     toDate = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
// }

// var today = dateFormatter(new Date());
// today = new Date(today);
// let dateCond = {};
// if (fromDate !== undefined && toDate !== undefined) {
//     dateCond = { between: [fromDate, toDate] };
// } else if (fromDate !== undefined && toDate == undefined) {
//     toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
//     dateCond = { between: [fromDate, toDate] };
// } else if (fromDate == undefined && toDate !== undefined) {
//     dateCond = { lte: toDate };
// } else {
//     fromDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-01 00:00:00";
//     toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() + " 23:59:59";
//     dateCond = { between: [fromDate, toDate] };
// }

// where: {
//     school_id: { inq: school_id },
//     class_id: { inq: class_id },
//     section_id: { inq: section_id },
//     studentUserId: studentUserId,
//     attendanceDate: dateCond,
//     and: [subjectCond]
// },