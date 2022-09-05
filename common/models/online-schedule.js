'use strict';
var FCM = require('fcm-push');
var moment = require('moment');

module.exports = function (Onlineschedule) {

    Onlineschedule.addSchedule = function (data, cb) {
        let msg = {};
        // console.log(data);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let class_level = (data.class_level == undefined || data.class_level == null || data.class_level == '' ? undefined : data.class_level);
        let class_type = (data.class_type == undefined || data.class_type == null || data.class_type == '' ? undefined : data.class_type);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '' ? undefined : data.created_on);
        let modified_on = (data.modified_on == undefined || data.modified_on == null || data.modified_on == '' ? undefined : data.modified_on);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? 0 : data.user_id);
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '' ? undefined : data.country_lesson_id);
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let Onlinescheduledetails = Onlineschedule.app.models.online_schedule_details;

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id" };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        start_date = new Date(start_date);
        start_date = start_date.getFullYear() + '-' + (start_date.getMonth() + 1) + '-' + start_date.getDate() + ' ' + start_date.getHours() + ":" + start_date.getMinutes();
        end_date = new Date(end_date);
        end_date = end_date.getFullYear() + '-' + (end_date.getMonth() + 1) + '-' + end_date.getDate() + ' ' + end_date.getHours() + ":" + end_date.getMinutes();
        let scheduleObj = {
            user_id: user_id,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            lesson_id: lesson_id[0],
            class_level: class_level,
            class_type: class_type,
            start_date: start_date,
            end_date: end_date,
            status: status,
            created_on: created_on,
            modified_on: modified_on,
            created_by: created_by,
            modified_by: modified_by,
            country_id: country_id,
            country_lesson_id: country_lesson_id
        }

        let start_1 = {
            and: [
                { start_date: { gte: start_date } },
                { end_date: { lte: end_date } }
            ]
        }
        let start_2 = {
            and: [
                { start_date: { lte: start_date } },
                { end_date: { gte: end_date } }
            ]
        }
        // console.log({
        //     school_id: school_id,
        //     class_id: class_id,
        //     section_id: section_id,
        //     or: [start_1, start_2]})
        Onlineschedule.findOne({
            where: {
                and: [
                    { school_id: school_id },
                    { class_id: class_id },
                    { section_id: section_id },
                    { or: [start_1, start_2] },
                    { or: [{ status: 1 }, { status: 2 }] },
                ]
            }
        }, function (err, response) {
            if (err) {
                console.log(err)
            }
            if (!response) {
                Onlineschedule.upsert(scheduleObj, function (err, result) {
                    if (err) {
                        console.log(err);
                        return cb(null, err);
                    }
                    lesson_id.forEach(lessonId => {
                        let obj = {
                            lesson_id: lessonId,
                            schedule_id: result.id,
                            status: status
                        }
                        Onlinescheduledetails.upsert(obj, function (err, res) {
                            if (err) { return cb(err) }
                        })
                    });
                    // Onlinescheduledetails.
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
            else {
                msg = { status: false, message: "Schedule already exists." };
                return cb(null, msg);
            }
        });
    }

    Onlineschedule.remoteMethod(
        'addSchedule',
        {
            http: { path: '/addSchedule', verb: 'post' },
            description: 'Create Schedule',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Onlineschedule.editSchedule = async function (data, cb) {
        let msg = {};
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '' ? undefined : data.lesson_id);
        let class_level = (data.class_level == undefined || data.class_level == null || data.class_level == '' ? undefined : data.class_level);
        let class_type = (data.class_type == undefined || data.class_type == null || data.class_type == '' ? undefined : data.class_type);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let modified_on = (data.modified_on == undefined || data.modified_on == null || data.modified_on == '' ? undefined : data.modified_on);
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? 0 : data.user_id);
        let deep_link = 'ms://marksharks/cbse/{Grade}/ClassScheduleActivity';
        let image_url = '';
        let cond = [];
        let userCond = [];
        let sent_by = modified_by;
        let rescheduled = 0;
        let country_lesson_id = (data.country_lesson_id == undefined || data.country_lesson_id == null || data.country_lesson_id == '' ? undefined : data.country_lesson_id);
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id" };
            return cb(null, msg);
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id" };
            return cb(null, msg);
        }

        if (modified_by == undefined) {
            msg = { status: false, message: "Please provide modified by" };
            return cb(null, msg);
        }

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id" };
            return cb(null, msg);
        }

        let editChange = await checkChanges(schedule_id, status, start_date, end_date);
        if (editChange.sendNoti) {
            rescheduled = 1;
        }
        let editData = await editScheduleFn(rescheduled, start_date, end_date, user_id, school_id, class_id, section_id,
            subject_id, lesson_id, class_level, class_type, status, modified_on, modified_by, schedule_id, country_id, country_lesson_id);

        if (editChange.sendNoti) {
            // console.log("here i am");
            let title = "Schedule Change"
            let message = editChange.message;

            userCond.push({ status: 1 });
            cond.push({ school_id: school_id });
            cond.push({ class_id: class_id });
            cond.push({ section_id: section_id });
            cond.push({ subject_id: subject_id });

            if (userCond.length < 1) {
                userCond.push({ contactNumber: { neq: '' } });
            }
            // console.log("here i am");
            let notification = await getStudents(cond, userCond, title, message, class_id, deep_link, image_url, sent_by)
        }
        // console.log(editChange);
        return (editData);
    }

    Onlineschedule.remoteMethod(
        'editSchedule',
        {
            http: { path: '/editSchedule', verb: 'post' },
            description: 'Create Schedule',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let editScheduleFn = (rescheduled, start_date, end_date, user_id, school_id, class_id, section_id, subject_id, lesson_id, class_level,
        class_type, status, modified_on, modified_by, schedule_id, country_id, country_lesson_id) => {
        return new Promise((resolve, reject) => {
            let Onlinescheduledetails = Onlineschedule.app.models.online_schedule_details;
            let msg = {};
            start_date = new Date(start_date);
            start_date = start_date.getFullYear() + '-' + (start_date.getMonth() + 1) + '-' + start_date.getDate() + ' ' + start_date.getHours() + ":" + start_date.getMinutes();
            end_date = new Date(end_date);
            end_date = end_date.getFullYear() + '-' + (end_date.getMonth() + 1) + '-' + end_date.getDate() + ' ' + end_date.getHours() + ":" + end_date.getMinutes();
            let scheduleObj = {
                user_id: user_id,
                school_id: school_id,
                class_id: class_id,
                section_id: section_id,
                subject_id: subject_id,
                lesson_id: lesson_id[0],
                class_level: class_level,
                class_type: class_type,
                start_date: start_date,
                end_date: end_date,
                rescheduled: rescheduled,
                status: status,
                modified_on: modified_on,
                modified_by: modified_by,
                country_id: country_id,
                country_lesson_id: country_lesson_id
            }

            let start_1 = {
                and: [
                    { start_date: { gte: start_date } },
                    { end_date: { lte: end_date } }
                ]
            }
            let start_2 = {
                and: [
                    { start_date: { lte: start_date } },
                    { end_date: { gte: end_date } }
                ]
            }
            // console.log({
            //     school_id: school_id,
            //     class_id: class_id,
            //     section_id: section_id,
            //     or: [start_1, start_2]})
            Onlineschedule.findOne({
                where: {
                    and: [
                        { id: { neq: schedule_id } },
                        { school_id: school_id },
                        { class_id: class_id },
                        { section_id: section_id },
                        { or: [start_1, start_2] },
                        { or: [{ status: 1 }, { status: 2 }] },
                    ]
                }
            }, function (err, response) {
                if (err) {
                    console.log(err)
                }
                if (!response) {
                    Onlineschedule.update({ id: schedule_id }, scheduleObj, function (err, result) {
                        if (err) {
                            reject(err);
                            // return cb(null, err);
                        }
                        Onlinescheduledetails.destroyAll({ schedule_id: schedule_id }, function (err, rVal) {
                            lesson_id.forEach(lessonId => {
                                let obj = {
                                    lesson_id: lessonId,
                                    schedule_id: schedule_id,
                                    status: status
                                }
                                Onlinescheduledetails.upsert(obj, function (err, res) {
                                    if (err) { reject(err) }
                                })
                            });
                        });

                        msg = { status: true, data: result };
                        resolve(msg);
                        // return cb(null, msg);
                    });
                }
                else {
                    msg = { status: false, message: "Schedule already exists." };
                    resolve(msg);
                    // return cb(null, msg);
                }
            });
        })
    }

    let checkChanges = (schedule_id, status, start_date, end_date) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Onlineschedule.findOne({ where: { id: schedule_id } }, function (err, oldSchedule) {

                // console.log(start_date, oldSchedule.start_date.toISOString());
                if (start_date != oldSchedule.start_date.toISOString() ||
                    end_date != oldSchedule.end_date.toISOString()) {
                    let Onlinescheduleprevdates = Onlineschedule.app.models.online_schedule_prev_dates;
                    let prevSchObj = {
                        schedule_id: schedule_id,
                        start_date: start_date,
                        end_date: end_date
                    }
                    Onlinescheduleprevdates.upsert(prevSchObj, function (error, res) { });
                    msg = { sendNoti: true, message: 'Schedule timing Change' }
                    resolve(msg);
                } else if (status != oldSchedule.status) {
                    msg = { sendNoti: true, message: 'Schedule Status Change' }
                    resolve(msg);
                } else {
                    msg = { sendNoti: false, message: '' }
                    resolve(msg);
                }
            });
        })
    }

    let getStudents = (cond, userCond, title, message, class_id, deep_link, image_url, sent_by) => {
        return new Promise((resolve, reject) => {
            // console.log(cond);
            let schoolUserData;

            schoolUserData = Onlineschedule.app.models.school_user_classes; //To send notification subject-wise in app

            schoolUserData.find({
                where: {
                    and: cond
                },
                include: [
                    {
                        relation: 'quiz_user_data',
                        scope: {
                            where: {
                                and: userCond
                            },
                            fields: ['email', 'contactNumber'],
                            include: [
                                {
                                    relation: 'quiz_user_fcms',
                                    scope: {
                                        where: {
                                            status: 1,
                                            class_id: class_id
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, studentData) {

                if (err) {
                    reject(err);
                }
                // console.log(studentData);
                if (studentData !== undefined) {
                    if (studentData.length > 0) {
                        studentData.forEach((studentVal) => {
                            // console.log(studentVal);
                            let userData = studentVal.toJSON().quiz_user_data;
                            let userFcm = JSON.stringify(userData);
                            // console.log(userFcm);
                            if (userFcm != undefined) {
                                userFcm = JSON.parse(userFcm);
                                if (userFcm.quiz_user_fcms.length > 0) {
                                    //let fcmId = userFcm.quiz_user_fcms[0].fcm_id;
                                    // console.log(fcmId);
                                    //fcmPush(fcmId, title, message, webNotify);
                                    userFcm.quiz_user_fcms.forEach((fVal) => {
                                        //let fcmId = userFcm[0].fcm_id;
                                        let fcmId = fVal.fcm_id;
                                        let sent_to = fVal.user_id
                                        let class_id = fVal.class_id
                                        // console.log(fcmId);
                                        deep_link = deep_link.replace('{Grade}', class_id);
                                        fcmPush(fcmId, title, message, deep_link, image_url, sent_to, class_id, sent_by);
                                    });
                                }
                            }

                        });
                        resolve('Push notification sent successfully.');
                    } else {
                        resolve('No record found.');
                    }
                } else {
                    resolve('No record found.');
                }
            })
        });
    }

    let fcmPush = (fcmId, title, message, deep_link, image_url, sent_to, class_id, sent_by) => {
        // console.log("here i am");
        var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
        var fcm = new FCM(serverKey);
        let logMsg = message;
        let nwMessage;
        nwMessage = {
            mp_message: message,
            mp_icnm: "ic_notification_bar",
            mp_title: title,
            deep_link: deep_link,
            image_url: image_url
        };

        if (image_url == '') {
            nwMessage = {
                mp_message: message,
                mp_icnm: "ic_notification_bar",
                mp_title: title,
                deep_link: deep_link
            };
        }

        // console.log(nwMessage);
        var message = {
            to: fcmId, // required fill with device token or topics
            collapse_key: 'type_a',
            data: nwMessage
        };
        //callback style
        fcm.send(message, function (err, response) {
            let result;
            let notifyMessage;
            if (err) {
                notifyMessage = "Not Sent";
                result = err;
            } else {
                result = response;
                notifyMessage = "Not Sent";
                if (JSON.parse(result).success == 1) {
                    notifyMessage = "Sent";
                }
            }

            let Pushnotificationlogs = Onlineschedule.app.models.push_notification_logs;
            let logObj = {
                module: "Class Reschedule",
                class_id: class_id,
                sent_to: sent_to,
                notification_message: notifyMessage,
                title: title,
                message: logMsg,
                response: result,
                sent_by: sent_by
            }
            Pushnotificationlogs.upsert(logObj, function (error, res) { });
        });
    }

    Onlineschedule.deleteSchedule = function (data, cb) {
        let msg = {};
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);

        if (schedule_id == undefined) {
            msg = { status: false, message: "Please provide schedule id" };
            return cb(null, msg);
        }

        Onlineschedule.update({ id: schedule_id }, { status: 5 }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Onlineschedule.remoteMethod(
        'deleteSchedule',
        {
            http: { path: '/deleteSchedule', verb: 'post' },
            description: 'Delete Schedule',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Onlineschedule.getAllSchedules = function (data, cb) {
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let schedule_to = (data.schedule_to == undefined || data.schedule_to == null || data.schedule_to == '' ? undefined : data.schedule_to);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let msg = {};
        let cond = {};
        let createdCond = {};
        let statusCond = {};
        let startdateCond = {};
        let enddateCond = {};
        if (start_date !== undefined) {
            let frmDate = dateFormatter(start_date);
            frmDate = new Date(frmDate);
            start_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
            startdateCond = { gte: start_date }
        } else {
            startdateCond = undefined
        }

        if (end_date !== undefined) {
            let tDate = dateFormatter(end_date);
            tDate = new Date(tDate);
            end_date = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
            enddateCond = { lte: end_date }
        } else {
            enddateCond = undefined
        }

        cond = {
            start_date: startdateCond,
            end_date: enddateCond
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }

        if (subject_id != undefined) {
            cond.subject_id = { inq: subject_id }
        }

        if (schedule_to != undefined) {
            cond.user_id = { inq: schedule_to }
        }

        if (created_by != undefined) {
            createdCond.created_by = { inq: created_by }
        }

        if (status == undefined) {
            statusCond = { or: [{ status: 1 }, { status: 2 }] };
        } else {
            statusCond = { status: status };
        }

        Onlineschedule.find({
            // where: { or: [createdCond, { and: [cond, statusCond] }] }
            where: { and: [cond, statusCond] }
        }, function (err, count) {
            if (err) {
                return cb(null, err);
            }
            Onlineschedule.find({
                // where: { or: [createdCond, { and: [cond, statusCond] }] },
                where: { and: [cond, statusCond] },
                limit: limit,
                skip: offset,
                order: 'created_on desc, start_date',
                include: [
                    {
                        relation: "school",
                        scope: {
                            fields: ['school_name']
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
                            fields: ['section_id'],
                            include: [{
                                relation: "class_section",
                                scope: {
                                    fields: ['section_name'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    },
                    {
                        relation: "lesson",
                        scope: {
                            fields: ['lesson_name', 'lesson_num']
                        }
                    },
                    {
                        relation: "scheduleDetail",
                        scope: {
                            include: [{
                                fields: ['lesson_id'],
                                relation: "lesson",
                                scope: {
                                    fields: ['lesson_name', 'lesson_num'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "modified_by",
                        scope: {
                            fields: ['username']
                        }
                    },
                    {
                        relation: "zoomClass",
                        scope: {
                            fields: ['id', 'meeting_status']
                        }
                    },
                    {
                        relation: "quizUser",
                        scope: {
                            fields: ['firstName', 'lastName']
                        }
                    },
                    {
                        relation: "country_lessons",
                        scope: {

                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, totalSchedule: count.length };
                return cb(null, msg);
            });
        });
    }

    Onlineschedule.remoteMethod(
        'getAllSchedules',
        {
            http: { path: '/getAllSchedules', verb: 'post' },
            description: 'Get active or inactive schedules',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Onlineschedule.getScheduleById = function (data, cb) {
        let msg = {};
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);

        if (schedule_id == undefined) {
            msg = { status: false, message: "Please provide schedule id" };
            return cb(null, msg);
        }

        Onlineschedule.findOne({
            where: { id: schedule_id },
            include: [
                {
                    relation: "scheduleDetail",
                    scope: {}
                },
                {
                    relation: "created_by",
                    scope: {
                        fields: ['firstName', 'lastName']
                    }
                },
                {
                    relation: "modified_by",
                    scope: {
                        fields: ['firstName', 'lastName']
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Onlineschedule.remoteMethod(
        'getScheduleById',
        {
            http: { path: '/getScheduleById', verb: 'post' },
            description: 'get Schedule by id for edit',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Onlineschedule.getScheduleTeacher = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let cond = { user_type: 1 };

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }

        let Userdata = Onlineschedule.app.models.user_data;
        Userdata.find({
            fields: ['id', 'user_id', 'studentName'],
            where: cond
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Onlineschedule.remoteMethod(
        'getScheduleTeacher',
        {
            http: { path: '/getScheduleTeacher', verb: 'post' },
            description: 'Teacher Schedule list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Onlineschedule.chkSchedule = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the school id";
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the class id";
            return cb(null, msg);
        }

        if (section_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the section id";
            return cb(null, msg);
        }

        let start_date = new Date();
        start_date.setMinutes(start_date.getMinutes() - 10);
        start_date = start_date.toISOString();
        let end_date = new Date();
        end_date.setMinutes(end_date.getMinutes() + 10);
        end_date = end_date.toISOString();

        let start_1 = {
            and: [
                { start_date: { between: [start_date, end_date] } }
            ]
        }

        Onlineschedule.findOne({
            where: {
                and: [
                    { school_id: school_id },
                    { class_id: class_id },
                    { section_id: section_id },
                    { or: [start_1] },
                    { status: 1 }
                ]
            },
            include: [
                {
                    relation: "school",
                    scope: {
                        fields: ['school_name']
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
                        fields: ['section_id'],
                        include: [{
                            relation: "class_section",
                            scope: {
                                fields: ['section_name'],
                            }
                        }]
                    }
                },
                {
                    relation: "subject",
                    scope: {
                        fields: ['subject_name']
                    }
                }
            ]
        }, function (err, response) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }

            if (response) {
                msg.status = true;
                msg.mssage = "Schedule Available.";
                return cb(null, msg);
            } else {
                msg.status = false;
                msg.message = "No online class scheduled. Please try again.";
                return cb(null, msg);
            }
        });
    }

    Onlineschedule.remoteMethod(
        'chkSchedule',
        {
            http: { path: '/chkSchedule', verb: 'post' },
            description: 'Check schedule for school/class/section',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }

        }
    );

    Onlineschedule.chkScheduleByUser = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;

        if (user_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the user id";
            return cb(null, msg);
        }

        let start_date = new Date();
        // start_date.setMinutes(start_date.getMinutes());
        start_date = start_date.getFullYear() + '-' + (start_date.getMonth() + 1) + '-' + start_date.getDate() + " " + start_date.getHours() + ":" + start_date.getMinutes();
        // let end_date = new Date();
        // end_date.setMinutes(end_date.getMinutes() + 10);
        // end_date = end_date.toISOString();

        let currentCondStart = { start_date: { lte: start_date } };
        let currentCondEnd = { end_date: { gte: start_date } };

        Onlineschedule.findOne({
            where: {
                and: [
                    { user_id: user_id },
                    currentCondStart,
                    currentCondEnd,
                    { status: 1 }
                ]
            }
        }, function (err, onChkResult) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            let scheduleCond = {};
            let start_date = new Date();
            start_date.setMinutes(start_date.getMinutes() - 10);
            start_date = start_date.toISOString();
            let end_date = new Date();
            end_date.setMinutes(end_date.getMinutes() + 10);
            end_date = end_date.toISOString();

            let start_1 = {
                and: [
                    { start_date: { between: [start_date, end_date] } }
                ]
            };

            if (onChkResult) {
                let startCond = {};
                let schedule_id = onChkResult.id;

                // let timeChkCond = {};
                if (onChkResult.class_status == '1') { // Check If class has already started then to skip 10 minutes check
                    scheduleCond = { id: schedule_id };
                } else {

                    scheduleCond = { or: [start_1] };
                }
            } else {
                scheduleCond = { or: [start_1] };
            }

            Onlineschedule.findOne({
                where: {
                    and: [
                        { user_id: user_id },
                        // { or: [start_1] },
                        { status: 1 },
                        scheduleCond
                    ]
                },
                include: [
                    {
                        relation: "school",
                        scope: {
                            fields: ['school_name']
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
                            fields: ['section_id'],
                            include: [{
                                relation: "class_section",
                                scope: {
                                    fields: ['section_name'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    }
                ]
            }, function (err, response) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    return cb(null, msg);
                }

                if (response) {
                    msg.status = true;
                    msg.mssage = "Schedule Available.";
                    msg.data = response;
                    return cb(null, msg);
                } else {
                    msg.status = false;
                    msg.message = "No online class scheduled. Please try again.";
                    return cb(null, msg);
                }
            });

        });
    }

    Onlineschedule.remoteMethod(
        'chkScheduleByUser',
        {
            http: { path: '/chkScheduleByUser', verb: 'post' },
            description: 'Check schedule of a user',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }

        }
    );

    Onlineschedule.getActiveSchedules = function (data, cb) {
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let msg = {};
        let cond = {};
        let startdateCond = {};
        let enddateCond = {};

        if (start_date !== undefined) {
            let frmDate = dateFormatter(start_date);
            frmDate = new Date(frmDate);
            start_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
            startdateCond = { gte: start_date }
        } else {
            startdateCond = undefined
        }

        if (end_date !== undefined) {
            let tDate = dateFormatter(end_date);
            tDate = new Date(tDate);
            end_date = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
            enddateCond = { lte: end_date }
        } else {
            enddateCond = undefined
        }

        cond = {
            status: 1,
            start_date: startdateCond,
            end_date: enddateCond
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }

        if (user_id != undefined) {
            cond.user_id = user_id
        }

        Onlineschedule.find({ where: cond }, function (err, count) {
            if (err) {
                return cb(null, err);
            }
            Onlineschedule.find({
                where: cond,
                limit: limit,
                skip: offset,
                order: 'start_date desc',
                include: [
                    {
                        relation: "school",
                        scope: {
                            fields: ['school_name']
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
                            fields: ['section_id'],
                            include: [{
                                relation: "class_section",
                                scope: {
                                    fields: ['section_name'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    },
                    {
                        relation: "lesson",
                        scope: {
                            fields: ['lesson_name', 'lesson_num']
                        }
                    },
                    {
                        relation: "modified_by",
                        scope: {
                            fields: ['username']
                        }
                    },
                    {
                        relation: "zoomClass",
                        scope: {
                            fields: ['id']
                        }
                    },
                    {
                        relation: "quizUser",
                        scope: {
                            fields: ['firstName', 'lastName']
                        }
                    },
                    {
                        relation: "country_lessons",
                        scope: {

                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, totalSchedule: count.length };
                return cb(null, msg);
            });
        });
    }

    Onlineschedule.remoteMethod(
        'getActiveSchedules',
        {
            http: { path: '/getSchedules', verb: 'post' },
            description: 'Get active schedules',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Onlineschedule.getUnderUser = async function (data, cb) {
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let msg = {};

        if (user_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the user id";
            return cb(null, msg);
        }
        let assignedArr = [];
        let created_by = [];
        created_by.push(user_id);
        assignedArr.push(user_id);
        await allCreatedByLower(created_by, assignedArr);
        return assignedArr;
    }

    Onlineschedule.remoteMethod(
        'getUnderUser',
        {
            http: { path: '/getUnderUser', verb: 'post' },
            description: 'get Under User',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let allCreatedByLower = (created_by, assignedArr) => {
        return new Promise((resolve, reject) => {
            let user = Onlineschedule.app.models.user;
            let createdIds = [];
            user.find({ where: { assigned_to: { inq: created_by } } }, function (err, result) {
                if (err) {
                    return err;
                }
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        assignedArr.push(result[i].id);
                        createdIds.push(result[i].id);
                    }
                    resolve(allCreatedByLower(createdIds, assignedArr));
                }
                else {
                    resolve(assignedArr);
                }
            });
        });
    }

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

    Onlineschedule.teacherAttendanceReport = async function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let teacherName = (data.teacherName == undefined || data.teacherName == null || data.teacherName == '') ? undefined : data.teacherName;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;
        let fromDate = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let toDate = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);
        let takenBy = (data.takenBy == undefined || data.takenBy == null || data.takenBy == '' ? undefined : data.takenBy);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = '';
        
        if (status == 1) {
            cond = cond + " and os.class_status IN(1,2) and os.status IN(1,2)";
        }
        else if (status == 3) {
            cond = cond + " and os.rescheduled = " + 1 + " and os.status IN(1,2)";
        }
        else if (status == 5) {
            cond = cond + " and os.status = " + 5;
        }
        else {
            cond = cond + " and os.class_status = " + 2 + " and os.status IN(1,2)";
        }

        if (teacherName != undefined) {
            cond = cond + " and ( qu.firstName like '%" + teacherName + "%' or  qu.lastName like '%" + teacherName + "%')";
        }

        if(takenBy != undefined){
            cond = cond + " and qu.id = " + takenBy;
        }

        if (school_id !== undefined) {
            cond = cond + " and os.school_id IN(" + school_id.join() + ")";
        }

        if (class_id !== undefined) {
            cond = cond + " and os.class_id IN(" + class_id.join() + ")";
        }

        if (section_id !== undefined) {
            cond = cond + " and os.section_id IN(" + section_id.join() + ")";
        }

        if (subject_id !== undefined) {
            cond = cond + " and os.subject_id IN(" + subject_id.join() + ")";
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

        //var today = new Date();
        var today = dateFormatter(new Date());
        today = new Date(today);
        let dateCond = {};
        if (fromDate !== undefined && toDate !== undefined) {
            cond = cond + " and os.start_date >= '" + fromDate + "'" + " and os.start_date <= '" + toDate + "'"
            // cond = cond + " and os.start_date <= '" + toDate + "'"
            // dateCond = { gte: fromDate, lte: toDate };
        } else if (fromDate !== undefined && toDate == undefined) {
            toDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            cond = cond + " and os.start_date >= '" + fromDate + "'" + " and os.start_date <= '" + toDate + "'"
            // cond = cond + " and os.start_date <= '" + toDate + "'"
            // dateCond = { gte: fromDate, lte: toDate };
        } else if (fromDate == undefined && toDate !== undefined) {
            cond = cond + " and os.start_date <= '" + toDate + "'"
            // dateCond = { lte: toDate };
        }


        let schedule_id = await getSchedueId(cond);
        // console.log(response);
        let teacherData = await ScheduleTeacher(schedule_id, limit, offset);
        return teacherData;
    }

    Onlineschedule.remoteMethod(
        'teacherAttendanceReport',
        {
            http: { path: '/teacherAttendanceReport', verb: 'post' },
            description: 'Teacher Attendance Report',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getSchedueId = (cond) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            var ds = Onlineschedule.dataSource;
            let params;

            var sql = `SELECT os.*
            FROM online_schedule os
            join quiz_user qu ON qu.id = os.user_id
            Left join zoom_class_meetings zcm on zcm.schedule_id = os.id
            where 1=1 ${cond} GROUP by os.id`
            // console.log(sql);
            ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    msg = { status: false, message: err.message }
                    reject(msg);
                }
                let schedule_id = [];
                result.forEach((schedule) => {
                    schedule_id.push(schedule.id);
                });
                resolve(schedule_id);
            });
        })
    }

    let ScheduleTeacher = (schedule_id, limit, offset) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Onlineschedule.find({ where: { id: { inq: schedule_id } } }, function (err, count) {
                Onlineschedule.find({
                    where: {
                        id: { inq: schedule_id },
                    },
                    limit: limit,
                    skip: offset,
                    order: "id desc",
                    fields: ['id', 'user_id', 'school_id', 'class_id', 'section_id', 'subject_id', 'start_date', 'end_date'],
                    include: [
                        {
                            relation: 'quizUser',
                            scope: {
                                fields: ['email', 'firstName', 'lastName'],
                            }
                        },
                        {
                            relation: 'zoomClass',
                            scope: {}
                        },
                        {
                            relation: 'attendance',
                            scope: {
                                fields: ['id'],
                            }
                        },
                        {
                            relation: 'school',
                            scope: {
                                fields: ['school_name'],
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
                            relation: 'subject',
                            scope: {
                                fields: ['subject_name'],
                            }
                        },
                    ]
                }, function (err, teacherData) {
                    if (err) {
                        msg = { status: false, message: err.message }
                        reject(msg);
                    } else {
                        msg = { status: true, data: teacherData, totalCount: count.length };
                        resolve(msg);
                    }
                });
            })
        })
    }

    Onlineschedule.getActiveSchedulesTab = function (data, cb) {
        let scheduleType = (data.scheduleType == undefined || data.scheduleType == null || data.scheduleType == '' ? undefined : data.scheduleType);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let sortBy = (data.sortBy == undefined || data.sortBy == null || data.sortBy == '') ? 'start_date' : data.sortBy;
        let sortDirection = (data.sortDirection == undefined || data.sortDirection == null || data.sortDirection == '') ? 'desc' : data.sortDirection;
        let msg = {};
        let cond = {};
        let startdateCond = {};
        let enddateCond = {};

        var firstDay = moment().startOf('week').toDate();
        // firstDay = dateFormatter(firstDay);
        // firstDay = new Date(firstDay);
        var lastDay = moment().endOf('week').toDate();
        // lastDay = dateFormatter(lastDay);
        // lastDay = new Date(lastDay);

        if (scheduleType == 'current') {
            firstDay = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate() + " 00:00:00";
            startdateCond = { gte: firstDay }
            lastDay = lastDay.getFullYear() + "-" + (lastDay.getMonth() + 1) + "-" + lastDay.getDate() + " 23:59:59";
            enddateCond = { lte: lastDay };
        }
        else if (scheduleType == 'upcoming') {
            lastDay = lastDay.getFullYear() + "-" + (lastDay.getMonth() + 1) + "-" + lastDay.getDate() + " 23:59:59";
            startdateCond = { gte: lastDay }
            enddateCond = undefined;
        }
        else if (scheduleType == 'past') {
            firstDay = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate() + " 00:00:00";
            enddateCond = { lte: firstDay };
            startdateCond = undefined
        }

        if (start_date !== undefined) {
            let frmDate = dateFormatter(start_date);
            frmDate = new Date(frmDate);
            start_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
            startdateCond = { gte: start_date }
        } else if (scheduleType == undefined) {
            startdateCond = undefined
        }

        if (end_date !== undefined) {
            let tDate = dateFormatter(end_date);
            tDate = new Date(tDate);
            end_date = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
            enddateCond = { lte: end_date }
        } else if (scheduleType == undefined) {
            enddateCond = undefined
        }

        cond = {
            status: 1,
            start_date: startdateCond,
            end_date: enddateCond
        }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }

        if (user_id != undefined) {
            cond.user_id = user_id
        }
        // console.log(cond);
        Onlineschedule.find({ where: cond }, function (err, count) {
            if (err) {
                return cb(null, err);
            }
            Onlineschedule.find({
                where: cond,
                limit: limit,
                skip: offset,
                order: sortBy + ' ' + sortDirection,
                include: [
                    {
                        relation: "school",
                        scope: {
                            fields: ['school_name']
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
                            fields: ['section_id'],
                            include: [{
                                relation: "class_section",
                                scope: {
                                    fields: ['section_name'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            fields: ['subject_name']
                        }
                    },
                    {
                        relation: "lesson",
                        scope: {
                            fields: ['lesson_name', 'lesson_num']
                        }
                    },
                    {
                        relation: "scheduleDetail",
                        scope: {
                            include: [{
                                fields: ['lesson_id'],
                                relation: "lesson",
                                scope: {
                                    fields: ['lesson_name', 'lesson_num'],
                                }
                            }]
                        }
                    },
                    {
                        relation: "modified_by",
                        scope: {
                            fields: ['username']
                        }
                    },
                    {
                        relation: "zoomClass",
                        scope: {
                            fields: ['id']
                        }
                    },
                    {
                        relation: "quizUser",
                        scope: {
                            fields: ['firstName', 'lastName']
                        }
                    },
                    {
                        relation: "country_lessons",
                        scope: {

                        }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, totalSchedule: count.length };
                return cb(null, msg);
            });
        });
    }

    Onlineschedule.remoteMethod(
        'getActiveSchedulesTab',
        {
            http: { path: '/getSchedulesTab', verb: 'post' },
            description: 'Get active schedules',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
