'use strict';

module.exports = function (Polluseranswers) {

    Polluseranswers.addUserAnswer = function (data, cb) {
        let msg = {};
        let teacherUserId = (data.teacherUserId == undefined || data.teacherUserId == null || data.teacherUserId == '' ? undefined : data.teacherUserId);
        let studentUserId = (data.studentUserId == undefined || data.studentUserId == null || data.studentUserId == '' ? undefined : data.studentUserId);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
        // let poll_question_id = (data.poll_question_id == undefined || data.poll_question_id == null || data.poll_question_id == '' ? undefined : data.poll_question_id);
        // let poll_answer_id = (data.poll_answer_id == undefined || data.poll_answer_id == null || data.poll_answer_id == '' ? undefined : data.poll_answer_id);
        let pollQueAnsArr = (data.pollQueAnsArr == undefined || data.pollQueAnsArr == null || data.pollQueAnsArr == '' ? undefined : data.pollQueAnsArr);
        let comments = (data.comments == undefined || data.comments == null || data.comments == '' ? undefined : data.comments);
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '' ? undefined : data.created_on);

        if (pollQueAnsArr == undefined) {
            msg.status = false;
            msg.message = "Please select a answer.";
            return cb(null, msg);
        }

        if (teacherUserId == undefined) {
            msg = { status: false, message: "Please provide teacher_User_id" };
            return cb(null, msg);
        }

        if (studentUserId == undefined) {
            msg = { status: false, message: "Please provide student_User_id" };
            return cb(null, msg);
        }

        if (pollQueAnsArr == undefined) {
            msg = { status: false, message: "Please provide poll que ans array" };
            return cb(null, msg);
        }
        let Pollquestions = Polluseranswers.app.models.poll_questions;
        Pollquestions.find({
            where: { status: 1 }
        }, function (err, pollData) {
            if (err) {
                msg.status = false;
                msg.message = "Invalid data.";
                return cb(null, msg);
            }

            if (pollData.length !== pollQueAnsArr.length) {
                msg.status = false;
                msg.message = "Please provide all answers.";
                return cb(null, msg);
            } else {
                let incVal = 0;
                pollQueAnsArr.forEach(queAns => {
                    let userAnsObj = {
                        teacherUserId: teacherUserId,
                        studentUserId: studentUserId,
                        schedule_id: schedule_id,
                        poll_question_id: queAns.poll_question_id,
                        poll_answer_id: queAns.poll_answer_id,
                        comments: queAns.comments,
                        created_on: created_on
                    }
                    // console.log(userAnsObj);
                    Polluseranswers.upsertWithWhere(
                        {
                            studentUserId: studentUserId,
                            teacherUserId: teacherUserId,
                            schedule_id: schedule_id,
                            poll_question_id: queAns.poll_question_id,
                        },
                        userAnsObj,
                        function (err, result) {
                            if (err) {
                                console.log(err)
                            }

                        }
                    );
                    incVal++;
                });
                if (incVal == pollQueAnsArr.length) {
                    msg = { status: true, message: "Poll submitted successfully." }
                    return cb(null, msg);
                } else {
                    msg = { status: true, message: "Error. Please try again." }
                    return cb(null, msg);
                }
            }
        }
        );


    }

    Polluseranswers.remoteMethod(
        'addUserAnswer',
        {
            http: { path: '/addUserAnswer', verb: 'post' },
            description: 'Delete Schedule',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Polluseranswers.getPollResult = function (data, cb) {
        // console.log(data);
        let msg = {};
        let startDate = (data.startDate == undefined || data.startDate == null || data.startDate == '' ? undefined : data.startDate);
        let endDate = (data.endDate == undefined || data.endDate == null || data.endDate == '' ? undefined : data.endDate);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let poll_question_id = (data.poll_question_id == undefined || data.poll_question_id == null || data.poll_question_id == '' ? undefined : data.poll_question_id);
        let teacherUserId = (data.teacherUserId == undefined || data.teacherUserId == null || data.teacherUserId == '' ? undefined : data.teacherUserId);
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);

        if (poll_question_id == undefined) {
            msg.status = false;
            msg.message = "Please provide poll question id.";
            return cb(null, msg);
        }
        var ds = Polluseranswers.dataSource;
        let params;
        let cond = '';

        if (startDate != undefined) {
            // let start_date = new Date(startDate);
            // startDate = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate()
            let start_date = dateFormatter(startDate);
            start_date = new Date(start_date);
            startDate = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate()+" 00:00:00";
            cond = cond + " and pua.created_on >= '" + startDate + "'";
        }
        if (endDate != undefined) {
            // let end_date = new Date(endDate);
            // endDate = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate()
            let end_date = dateFormatter(endDate);
            end_date = new Date(end_date);
            endDate = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate()+" 23:59:59";
            cond = cond + " and pua.created_on <= '" + endDate + "'"
        }

        cond = cond + " and pua.poll_question_id = " + poll_question_id;

        if (teacherUserId != undefined) {
            cond = cond + " and pua.teacherUserId IN(" + teacherUserId.join() + ")";
        }

        if (school_id != undefined) {
            cond = cond + " and os.school_id IN(" + school_id.join() + ")";
        }

        if (class_id != undefined) {
            cond = cond + " and os.class_id IN(" + class_id.join() + ")";
        }

        if (section_id != undefined) {
            cond = cond + " and os.section_id IN(" + section_id.join() + ")";
        }

        if (schedule_id != undefined) {
            cond = cond + " and pua.schedule_id = " + schedule_id
        }

        var sql = `SELECT pua.poll_question_id, pa.answer, pa.id
            FROM poll_user_answers pua
            join online_schedule os on pua.schedule_id = os.id
            join poll_answers pa on pua.poll_answer_id = pa.id
            where 1=1 ${cond}`
        //  console.log(sql);
        ds.connector.query(sql, params, function (err, result) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            msg = { status: true, data: result }
            return cb(null, msg);
        });
    }

    Polluseranswers.remoteMethod(
        'getPollResult',
        {
            http: { path: '/getPollResult', verb: 'post' },
            description: 'Delete Schedule',
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
