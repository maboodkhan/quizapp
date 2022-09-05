'use strict';
var FCM = require('fcm-push');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

module.exports = function (Homeworks) {
    Homeworks.fileUpload = function (req, res, cb) {
        let storage = multer.diskStorage({
            destination: (req, res, cb) => {
                if (!fs.existsSync(DIR)) {
                    var dir = fs.mkdirSync(DIR);
                }
                cb(null, DIR);
            },
            filename: (req, file, cb) => {
                let origFName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
                cb(null, origFName);
            }
        });

        var upload = multer({
            storage: storage
        }).array('file', 12);

        var message = {};
        var successMessage = {};
        const results = [];
        var impCount = [];
        var extName = '';
        var fileHeaders = [0, 'question'];
        upload(req, res, function (err) {
            if (err) {
                cb(null, err);
            }

            if (req.files[0]) {
                extName = path.extname(req.files[0].originalname);
            }
            if (!req.files) {
                message = { 'status': false, 'message': 'File not found' };
                cb(null, message);
            } else if ('.zip' != extName) {
                message = { 'status': false, 'message': 'Only *.zip file is allowed.' };
                cb(null, message);
            } else {
                message = { 'status': true, 'message': 'File uploaded successfully.' };
                cb(null, message);
            }
        });
    }

    Homeworks.remoteMethod(
        'fileUpload',
        {
            http: { path: '/upload', verb: 'post' },
            description: 'Upload File',
            accepts: [
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: { arg: 'response', type: 'json' }
        }
    );

    Homeworks.addHomeWork = async function (data, cb) {
        let msg = {};
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let description = (data.description == undefined || data.description == null || data.description == '' ? undefined : entities.encode(data.description));
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let expiration_date = (data.expiration_date == undefined || data.expiration_date == null || data.expiration_date == '' ? undefined : data.expiration_date);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let filepath = (data.filepath == undefined || data.filepath == null || data.filepath == '' ? undefined : data.filepath);
        let user_type = (data.user_type == undefined || data.user_type == null || data.user_type == '' ? 1 : data.user_type);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        deep_link = "ms://marksharks/cbse/{Grade}/HomeWorkStudentsActivity";
        let webNotify = true;
        let notifiTitle = "New Homework";
        let notifiMessage = "There is a homework for you!!!";

        try{
            if (title == undefined) {
                msg = { status: false, message: "Please provide title." };
                return msg;
            }
    
            if (created_by == undefined) {
                msg = { status: false, message: "Please provide created_by." };
                return msg;
            }
    
            if (filepath != undefined && user_type == undefined) {
                msg = { status: false, message: "Please provide user type." };
                return msg;
            }
    
            if (status == undefined) {
                msg = { status: false, message: "Please provide status." };
                return msg;
            }
    
            if (school_id == undefined) {
                msg = { status: false, message: "Please provide school id." };
                return msg;
            }
    
            if (class_id == undefined) {
                msg = { status: false, message: "Please provide class id." };
                return msg;
            }
    
            if (section_id == undefined) {
                msg = { status: false, message: "Please provide section id." };
               return msg;
            }
    
            if (subject_id == undefined) {
                msg = { status: false, message: "Please provide subject id." };
                return msg;
            }
    
            if (expiration_date == undefined) {
                msg = { status: false, message: "Please provide expiration date." };
                return msg;
            }
    
            let homeWorkdata = await addHomework(title, description, status, created_by, expiration_date);
            await addHWDetails(homeWorkdata, school_id, class_id, section_id, subject_id, status, created_by, user_id);
            if (filepath != undefined) {
                await addHWFiles(homeWorkdata, filepath, user_type, status, created_by);
            }
            if (status == 1) {
                await getStudents(school_id, class_id, section_id, webNotify, created_by, notifiTitle, notifiMessage, deep_link, image_url);
            }
            msg = { status: true, data: homeWorkdata }
            return msg;
        } catch (error) {
            console.log(error)
            msg = { status: false, message: "Error in saving Homework. Please try again." };
            return msg;
        }
        
    }

    Homeworks.remoteMethod(
        'addHomeWork',
        {
            http: { path: '/addHomeWork', verb: 'post' },
            description: 'Add Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let addHomework = (title, description, status, created_by, expiration_date) => {
        return new Promise((resolve, reject) => {
            expiration_date = new Date(expiration_date);
            expiration_date = expiration_date.getFullYear() + '-' + (expiration_date.getMonth() + 1) + '-' + expiration_date.getDate() + ' ' + expiration_date.getHours() + ":" + expiration_date.getMinutes();
            // let expireDate = dateFormatter(expiration_date);
            // expiration_date = new Date(expireDate);
            let obj = {
                title: title,
                description: description,
                created_by: created_by,
                expiration_date: expiration_date,
                status: status,
                created_on: new Date()
            }
            if (status == 1) {
                obj.submitted_on = new Date();
            }
            Homeworks.upsert(obj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            })
        });
    }

    let addHWDetails = (homeWorkdata, school_id, class_id, section_id, subject_id, status, created_by, user_id) => {
        return new Promise((resolve, reject) => {
            let Homeworkdetails = Homeworks.app.models.homework_details;
            school_id.forEach((schools_id) => {
                class_id.forEach((classes_id) => {
                    section_id.forEach((sections_id) => {
                        subject_id.forEach((subjects_id) => {
                            let saveObj = {
                                homework_id: homeWorkdata.id,
                                user_id: user_id,
                                school_id: schools_id,
                                class_id: classes_id,
                                section_id: sections_id,
                                subject_id: subjects_id,
                                created_by: created_by,
                                status: status,
                                created_on: new Date()
                            }
                            Homeworkdetails.upsert(saveObj, function (err, res) {
                                if (err) { reject(err) }
                            });
                        });
                    });
                });
            });
            resolve();
        });
    }

    let addHWFiles = (homeWorkdata, filepath, user_type, status, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkfiles = Homeworks.app.models.homework_files;
            let saveObj = {
                homework_id: homeWorkdata.id,
                filepath: filepath,
                user_type: user_type,
                created_by: created_by,
                status: status,
                created_on: new Date()
            }
            Homeworkfiles.upsert(saveObj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            })
        });
    }

    let getStudents = (school_id, class_id, section_id, webNotify, sent_by, notifiTitle, notifiMessage, deep_link, image_url) => {
        return new Promise((resolve, reject) => {
            // console.log(cond);
            let schoolUserData;
            if (webNotify) {
                schoolUserData = Homeworks.app.models.user_data; //To send notification section-wise
            } else {
                schoolUserData = Homeworks.app.models.school_user_classes; //To send notification subject-wise in app
            }

            schoolUserData.find({
                where: {
                    school_id: { inq: school_id },
                    class_id: { inq: class_id },
                    section_id: { inq: section_id }
                },
                include: [
                    {
                        relation: 'quiz_user_data',
                        scope: {

                            fields: ['email', 'contactNumber'],
                            include: [
                                {
                                    relation: 'quiz_user_fcms',
                                    scope: {
                                        where: {
                                            status: 1,
                                            class_id: { inq: class_id }
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
                                        fcmPush(fcmId, webNotify, sent_to, class_id, sent_by, notifiTitle, notifiMessage, deep_link, image_url);
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

    let fcmPush = (fcmId, webNotify, sent_to, class_id, sent_by, notifiTitle, notifiMessage, deep_link, image_url) => {
        var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
        var fcm = new FCM(serverKey);
        let module = "Homework";
        let nwMessage = {
            title: notifiTitle,
            message: notifiMessage,
            deep_link: deep_link,
            image_url: image_url
        };
        if (image_url == '') {
            nwMessage = {
                title: notifiTitle,
                message: notifiMessage,
                deep_link: deep_link
            };
        }

        if (webNotify) {
            nwMessage = {
                mp_message: notifiMessage,
                mp_icnm: "ic_notification_bar",
                mp_title: notifiTitle,
                deep_link: deep_link,
                image_url: image_url
            };
            if (image_url == '') {
                nwMessage = {
                    mp_message: notifiMessage,
                    mp_icnm: "ic_notification_bar",
                    mp_title: notifiTitle,
                    deep_link: deep_link
                };
            }
        }
        // let nwMessage = {
        //     title: notifiTitle,
        //     message: notifiMessage
        // };

        // if (webNotify) {
        //     module = "Homework";
        //     nwMessage = {
        //         mp_message: notifiMessage,
        //         mp_icnm: "ic_notification_bar",
        //         mp_title: notifiTitle
        //     };
        // }
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
            let Pushnotificationlogs = Homeworks.app.models.push_notification_logs;
            let logObj = {
                module: module,
                class_id: class_id,
                sent_to: sent_to,
                notification_message: notifyMessage,
                title: notifiTitle,
                message: notifiMessage,
                response: result,
                sent_by: sent_by
            }
            Pushnotificationlogs.upsert(logObj, function (error, res) { });
        });
    }

    Homeworks.getHWTeacher = function (data, cb) {
        let msg = {};
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let date = (data.date == undefined || data.date == null || data.date == '' ? undefined : data.date);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Homeworks.dataSource;
        let cond = '';
        let params;

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created by." };
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

        if (subject_id != undefined) {
            cond = cond + " and hwd.subject_id IN(" + subject_id.join() + ")";
        }

        if (title != undefined) {
            cond = cond + " and hw.title like '%" + title + "%'";
        }

        if (date != undefined) {
            let newDate = dateFormatter(date);
            newDate = new Date(newDate);
            let Gtdate = "'" + newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate() + " 00:00:00" + "'";
            let Ltdate = "'" + newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate() + " 23:59:59" + "'";
            cond = cond + " and hw.created_on > " + Gtdate + " and hw.created_on < " + Ltdate;
        }

        if (start_date != undefined) {
            let startDate = dateFormatter(start_date);
            startDate = new Date(startDate);
            start_date = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate()+" 00:00:00";
            cond = cond + " and hw.created_on >= '" + start_date + "'";
        }
        
        if (end_date != undefined) {
            let endDate = dateFormatter(end_date);
            endDate = new Date(endDate);
            end_date = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate()+" 23:59:59";
            cond = cond + " and hw.created_on <= '" + end_date + "'"
        }

        if (status == undefined) {
            cond = cond + " and hw.status IN(1,2)";
        } else {
            cond = cond + " and hw.status = " + status;
        }

        var countSql = `SELECT hw.*
        FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        join classes c on hwd.class_id = c.id
        join class_sections cs on hwd.section_id = cs.id
        join sections s on cs.section_id = s.id
        join subjects sub on hwd.subject_id = sub.id
        Left join homework_files hwf on hwf.homework_id = hw.id
        Left join homework_submissions hws on hws.homework_id = hw.id and hws.status = 1
        where hwd.school_id IN(${school_id}) and hwd.class_id IN(${class_id})
        and hwd.section_id IN(${section_id}) and hw.created_by = ${created_by} 
        and hw.status IN(1,2) ${cond}
        GROUP by hw.id;`

        var sql = `SELECT hw.*, hwd.school_id, hwd.class_id, hwd.section_id, hws.id as submission_id,
        c.class_name, s.section_name, sub.subject_name
        FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        join classes c on hwd.class_id = c.id
        join class_sections cs on hwd.section_id = cs.id
        join sections s on cs.section_id = s.id
        join subjects sub on hwd.subject_id = sub.id
        Left join homework_files hwf on hwf.homework_id = hw.id
        Left join homework_submissions hws on hws.homework_id = hw.id and hws.status = 1
        where hwd.school_id IN(${school_id}) and hwd.class_id IN(${class_id})
        and hwd.section_id IN(${section_id}) and hw.created_by = ${created_by} 
        and hw.status IN(1,2) ${cond}
        GROUP by hw.id
        ORDER BY hw.created_on DESC
        LIMIT ${offset},${limit};`
        // console.log(sql);

        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, homeWorkData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: homeWorkData, totalHW: count.length }
                return cb(null, msg);
            });
        });

    }

    Homeworks.remoteMethod(
        'getHWTeacher',
        {
            http: { path: '/getHWTeacher', verb: 'post' },
            description: 'Get Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Homeworks.getHWStudent = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let start_date = (data.start_date == undefined || data.start_date == null || data.start_date == '' ? undefined : data.start_date);
        let end_date = (data.end_date == undefined || data.end_date == null || data.end_date == '' ? undefined : data.end_date);
        let date = (data.date == undefined || data.date == null || data.date == '' ? undefined : data.date);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Homeworks.dataSource;
        let cond = '';
        let params;

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

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id." };
            return cb(null, msg);
        }

        if (subject_id != undefined) {
            cond = cond + " and hwd.subject_id IN(" + subject_id.join() + ")";
        }

        if (created_by != undefined) {
            cond = cond + " and hw.created_by IN(" + created_by.join() + ")";
        }

        if (date != undefined) {
            let newDate = dateFormatter(date);
            newDate = new Date(newDate);
            let Gtdate = "'" + newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate() + " 00:00:00" + "'";
            let Ltdate = "'" + newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate() + " 23:59:59" + "'";
            cond = cond + " and hw.created_on > " + Gtdate + " and hw.created_on < " + Ltdate;
        }

        if (start_date != undefined) {
            let startDate = dateFormatter(start_date);
            startDate = new Date(startDate);
            start_date = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate()+" 00:00:00";
            cond = cond + " and hw.created_on >= '" + start_date + "'";
        }
        
        if (end_date != undefined) {
            let endDate = dateFormatter(end_date);
            endDate = new Date(endDate);
            end_date = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate()+" 23:59:59";
            cond = cond + " and hw.created_on <= '" + end_date + "'"
        }

        if (title != undefined) {
            cond = cond + " and hw.title like '%" + title + "%'";
        }

        var countSql = `SELECT hw.*
        FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        join subjects sub on hwd.subject_id = sub.id
        join user_data ud on hw.created_by = ud.user_id
        Left join homework_submissions hws on hws.homework_id = hw.id and hws.status = 1 and hws.submitted_by = ${user_id}
        where hwd.school_id = ${school_id} and hwd.class_id = ${class_id}
        and hwd.section_id = ${section_id}
        and hw.status = 1 and hwd.status = 1 ${cond}
        GROUP by hw.id`

        var sql = `SELECT hw.*, hws.id as submission_id, sub.subject_name, ud.studentName as teacherName
        FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        join subjects sub on hwd.subject_id = sub.id
        join user_data ud on hw.created_by = ud.user_id
        Left join homework_submissions hws on hws.homework_id = hw.id and hws.status = 1 and hws.submitted_by = ${user_id}
        where hwd.school_id = ${school_id} and hwd.class_id = ${class_id}
        and hwd.section_id = ${section_id}
        and hw.status = 1 and hwd.status = 1 ${cond}
        GROUP by hw.id
        ORDER BY hw.created_on DESC
        LIMIT ${offset},${limit};`
        // console.log(sql);
        // count(hwr.id) as 'remarksCount'
        // left join homework_remarks hwr on hwr.homework_id = hw.id and (hwr.given_to=${user_id} OR hwr.created_by=${user_id})
        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, homeWorkData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: homeWorkData, totalHW: count.length }
                return cb(null, msg);
            });
        });

    }

    Homeworks.remoteMethod(
        'getHWStudent',
        {
            http: { path: '/getHWStudent', verb: 'post' },
            description: 'Get Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Homeworks.editHomeWork = async function (data, cb) {
        // console.log(data);
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let homeworkFile_id = (data.homeworkFile_id == undefined || data.homeworkFile_id == null || data.homeworkFile_id == '' ? 0 : data.homeworkFile_id);
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let description = (data.description == undefined || data.description == null || data.description == '' ? undefined : entities.encode(data.description));
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let expiration_date = (data.expiration_date == undefined || data.expiration_date == null || data.expiration_date == '' ? undefined : data.expiration_date);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' ? undefined : data.subject_id);
        let filepath = (data.filepath == undefined || data.filepath == null || data.filepath == '' ? undefined : data.filepath);
        let user_type = (data.user_type == undefined || data.user_type == null || data.user_type == '' ? 1 : data.user_type);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let webNotify = true;
        let notifiTitle = "Homework Updated";
        let notifiMessage = title + " homework has an update";
        deep_link = "ms://marksharks/cbse/{Grade}/HomeWorkStudentsActivity";

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return msg;
        }

        if (title == undefined) {
            msg = { status: false, message: "Please provide title." };
            return msg;
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created_by." };
            return msg;
        }

        if (filepath != undefined && user_type == undefined) {
            msg = { status: false, message: "Please provide user type." };
            return msg;
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status." };
            return msg;
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id." };
            return msg;
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id." };
            return msg;
        }

        if (section_id == undefined) {
            msg = { status: false, message: "Please provide section id." };
            return msg;
        }

        if (subject_id == undefined) {
            msg = { status: false, message: "Please provide subject id." };
            return msg;
        }

        if (expiration_date == undefined) {
            msg = { status: false, message: "Please provide expiration date." };
            return msg;
        }

        try {
            let homeWorkdata = await editHomework(homework_id, title, description, status, created_by, expiration_date);
            let hwDetail = await editHWDetails(homework_id, school_id, class_id, section_id, subject_id, status, created_by, user_id);
            if (filepath != undefined) {
                let hwFiles = await editHWFiles(homework_id, homeworkFile_id, filepath, user_type, status, created_by);
            }
            if (status == 1) {
                await getStudents(school_id, class_id, section_id, webNotify, created_by, notifiTitle, notifiMessage, deep_link, image_url);
            }
            msg = { status: true, data: homeWorkdata }
            return msg;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    Homeworks.remoteMethod(
        'editHomeWork',
        {
            http: { path: '/editHomeWork', verb: 'post' },
            description: 'Edit Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let editHomework = (homework_id, title, description, status, created_by, expiration_date) => {
        return new Promise((resolve, reject) => {
            Homeworks.findOne({ where: { id: homework_id } }, function (error, result) {
                expiration_date = new Date(expiration_date);
                expiration_date = expiration_date.getFullYear() + '-' + (expiration_date.getMonth() + 1) + '-' + expiration_date.getDate() + ' ' + expiration_date.getHours() + ":" + expiration_date.getMinutes();
                // let expireDate = dateFormatter(expiration_date);
                // expiration_date = new Date(expireDate);
                let obj = {
                    title: title,
                    description: description,
                    created_by: created_by,
                    expiration_date: expiration_date,
                    status: status,
                    modified_on: new Date()
                }
                if (result.submitted_on == null && status == 1) {
                    obj.submitted_on = new Date();
                }
                Homeworks.upsertWithWhere({ id: homework_id }, obj, function (err, res) {
                    if (err) { reject(err) }
                    resolve(res);
                });
            })
        });
    }

    let editHWDetails = (homework_id, school_id, class_id, section_id, subject_id, status, created_by, user_id) => {
        return new Promise((resolve, reject) => {
            let Homeworkdetails = Homeworks.app.models.homework_details;
            Homeworkdetails.destroyAll({ homework_id: homework_id }, function (err, rVal) {

                school_id.forEach((schools_id) => {
                    class_id.forEach((classes_id) => {
                        section_id.forEach((sections_id) => {
                            subject_id.forEach((subjects_id) => {
                                let saveObj = {
                                    homework_id: homework_id,
                                    user_id: user_id,
                                    school_id: schools_id,
                                    class_id: classes_id,
                                    section_id: sections_id,
                                    subject_id: subjects_id,
                                    created_by: created_by,
                                    status: status,
                                    created_on: new Date()
                                }
                                Homeworkdetails.upsert(saveObj, function (err, res) {
                                    if (err) { reject(err) }
                                });
                            });
                        });
                    });
                });
                resolve();
            });
        });
    }

    let editHWFiles = (homework_id, homeworkFile_id, filepath, user_type, status, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkfiles = Homeworks.app.models.homework_files;
            let saveObj = {
                homework_id: homework_id,
                filepath: filepath,
                user_type: user_type,
                created_by: created_by,
                status: status,
                created_on: new Date()
            }
            Homeworkfiles.upsertWithWhere({ id: homeworkFile_id }, saveObj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            })
        });
    }

    Homeworks.getHomeWorkById = function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        Homeworks.findOne({
            where: { id: homework_id },
            include: [
                {
                    relation: "homeworkDetails",
                    scope: {}
                },
                {
                    relation: "homeworkFiles",
                    scope: {
                        where: {
                            and:[
                                {submission_id: 0,remark_id: 0,user_type: 1},
                                {or: [{status:1},{status:2}]}
                            ]
                        }
                    }
                },
            ]
        }, function (err, result) {
            if (err) { return cb(null, err); }
            let school_id = [];
            let class_id = [];
            let section_id = [];
            let subject_id = [];
            let response = JSON.parse(JSON.stringify(result));
            response.homeworkDetails.forEach(element => {
                school_id.push(element.school_id);
                class_id.push(element.class_id);
                section_id.push(element.section_id);
                subject_id.push(element.subject_id);
            });
            school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
            class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
            section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
            subject_id = subject_id.filter((v, i, a) => a.indexOf(v) === i);
            msg = {
                status: true,
                data: result,
                school_id: school_id,
                class_id: class_id,
                section_id: section_id,
                subject_id: subject_id
            }
            return cb(null, msg);
            // })
        });
    }

    Homeworks.remoteMethod(
        'getHomeWorkById',
        {
            http: { path: '/getHomeWorkById', verb: 'post' },
            description: 'Get Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Homeworks.getStudentHWFile = function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created by." };
            return cb(null, msg);
        }

        Homeworks.findOne({
            where: { id: homework_id },
            include: [
                {
                    relation: "homeworkFiles",
                    scope: { where: { user_type: 1 } }
                },
                {
                    relation: "homeworkRemarks",
                    scope: { where: { created_by: created_by } }
                },
            ]
        }, function (err, result) {
            if (err) { return cb(null, err); }
            msg = { status: true, data: result }
            return cb(null, msg);
        })

    }

    Homeworks.remoteMethod(
        'getStudentHWFile',
        {
            http: { path: '/getStudentHWFile', verb: 'post' },
            description: 'Get Student Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Homeworks.getHWDetails = function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let user_type = (data.user_type == undefined ? undefined : data.user_type);
        let teacher_id = (data.teacher_id == undefined || data.teacher_id == null || data.teacher_id == '' ? undefined : data.teacher_id);
        let student_id = (data.student_id == undefined || data.student_id == null || data.student_id == '' ? undefined : data.student_id);
        let cond = {};

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        if (teacher_id == undefined) {
            msg = { status: false, message: "Please provide teacher id." };
            return cb(null, msg);
        }

        if (student_id == undefined) {
            msg = { status: false, message: "Please provide student id." };
            return cb(null, msg);
        }

        if (user_type == undefined) {
            msg = { status: false, message: "Please provide user_type." };
            return cb(null, msg);
        }

        cond = {
            and:
                [
                    { or: [{ created_by: student_id }, { created_by: teacher_id }] },
                    { or: [{ given_to: student_id }, { given_to: teacher_id }] },
                ]
        }

        Homeworks.findOne({
            where: { id: homework_id },
            include: [
                {
                    relation: "homeworkRemarks",
                    scope: {
                        where: cond,
                        include: [
                            {
                                relation: "homeworkFile",
                                scope: {
                                    where: {
                                        or: [{status:1},{status:2}]
                                    }
                                }
                            },
                            {
                                relation: "quiz_user_data",
                                scope: {}
                            },
                        ]
                    }
                },
                {
                    relation: "homeworkFiles",
                    scope: {
                        where: {
                            and:[
                                {submission_id: 0,remark_id: 0,user_type: 1},
                                {or: [{status:1},{status:2}]}
                            ]
                        }
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result }
            return cb(null, msg);
        });
    }

    Homeworks.remoteMethod(
        'getHWDetails',
        {
            http: { path: '/getHWDetails', verb: 'post' },
            description: 'Get Home Work Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Homeworks.deleteHomework = function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        let Homeworksubmissions = Homeworks.app.models.homework_submissions;
        Homeworksubmissions.findOne({ where: { homework_id: homework_id } }, function (err, response) {
            if (!response) {
                Homeworks.upsertWithWhere({ id: homework_id }, { status: 5 }, function (err, result) {
                    if (err) {
                        console.log(err);
                        return cb(null, err);
                    }
                    let Homeworkdetails = Homeworks.app.models.homework_details;
                    Homeworkdetails.upsertWithWhere({ homework_id: homework_id }, { status: 5 }, function (err, res) {

                        let Homeworkfiles = Homeworks.app.models.homework_files;
                        Homeworkfiles.upsertWithWhere({ homework_id: homework_id }, { status: 5 }, function (err, res) {
                            msg = { status: true, data: result }
                            return cb(null, msg);
                        });
                    });
                });
            } else {
                msg = { status: false, message: "Deletion is not allowed. Students' has submitted homework." }
                return cb(null, msg);
            }
        })


    }

    Homeworks.remoteMethod(
        'deleteHomework',
        {
            http: { path: '/deleteHomework', verb: 'post' },
            description: 'deleteHomework Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Homeworks.activeHomework = async function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        deep_link = "ms://marksharks/cbse/{Grade}/HomeWorkStudentsActivity";
        let webNotify = true;
        let notifiTitle = "New Homework";
        let notifiMessage = "There is a homework for you!!!";

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        let updateHW = await updateHWStatus(homework_id);
        let hWDetail = await getDetails(homework_id);
        await getStudents(hWDetail.school_id, hWDetail.class_id, hWDetail.section_id, webNotify, hWDetail.created_by, notifiTitle, notifiMessage, deep_link, image_url);
        return updateHW;

    }

    Homeworks.remoteMethod(
        'activeHomework',
        {
            http: { path: '/activeHomework', verb: 'post' },
            description: 'Active Homework Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let updateHWStatus = (homework_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Homeworks.update({ id: homework_id },
                { status: 1, submitted_on: new Date() },
                function (err, result) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    let Homeworkdetails = Homeworks.app.models.homework_details;
                    Homeworkdetails.update({ homework_id: homework_id }, { status: 1 }, function (err, res) {

                        let Homeworkfiles = Homeworks.app.models.homework_files;
                        Homeworkfiles.update({ homework_id: homework_id }, { status: 1 }, function (err, res) {
                            msg = { status: true, data: result }
                            resolve(msg);
                        });
                    });
                });
        });
    }

    let getDetails = (homework_id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Homeworkdetails = Homeworks.app.models.homework_details;
            Homeworks.findOne({ where: { id: homework_id } }, function (error, res) {
                Homeworkdetails.find({ where: { homework_id: homework_id } }, function (err, result) {
                    // console.log(result);
                    if (err) { reject(err); }
                    let school_id = [];
                    let class_id = [];
                    let section_id = [];
                    let response = JSON.parse(JSON.stringify(result));
                    response.forEach(element => {
                        school_id.push(element.school_id);
                        class_id.push(element.class_id);
                        section_id.push(element.section_id);
                    });
                    school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
                    class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
                    section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
                    msg = {
                        created_by: res.created_by,
                        school_id: school_id,
                        class_id: class_id,
                        section_id: section_id
                    }
                    // console.log(msg);
                    resolve(msg);
                })
            })

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

    Homeworks.submissionsToTutor = function (data, cb) {
        let msg = {};
        let submitted_by = (data.submitted_by == undefined || data.submitted_by == null || data.submitted_by == '' ? undefined : data.submitted_by);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        var ds = Homeworks.dataSource;
        let params;

        if (submitted_by == undefined) {
            msg = { status: false, message: "Please provide submitted_by id." };
            return cb(null, msg);
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created by." };
            return cb(null, msg);
        }

        var countSql = `SELECT hw.* FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        join homework_submissions hws on hws.homework_id = hw.id
        where hwd.school_id = ${school_id} and hwd.class_id = ${class_id}
        and hwd.section_id = ${section_id} and hw.created_by = ${created_by} 
        and hws.submitted_by = ${submitted_by}
        and hw.status = 1 GROUP by hw.id`

        var sql = `SELECT hw.* FROM homeworks hw
        join homework_details hwd on hwd.homework_id = hw.id
        Left join homework_submissions hws on hws.homework_id = hw.id
        where hwd.school_id = ${school_id} and hwd.class_id = ${class_id}
        and hwd.section_id = ${section_id} and hw.created_by = ${created_by} 
        and hws.submitted_by = ${submitted_by}
        and hw.status = 1 and hwd.status = 1
        GROUP by hw.id
        ORDER BY hw.created_on DESC
        LIMIT ${offset},${limit};`
        // console.log(sql);
        ds.connector.query(countSql, params, function (err, count) {
            ds.connector.query(sql, params, function (err, homeWorkData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg = { status: true, data: homeWorkData, totalHW: count.length }
                return cb(null, msg);
            });
        });

    }

    Homeworks.remoteMethod(
        'submissionsToTutor',
        {
            http: { path: '/submissionsToTutor', verb: 'post' },
            description: 'submitted To Tutor',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};


// Homeworks.update({ id: homework_id },
//     { status: 1, submitted_on: new Date() },
//     function (err, result) {
//     if (err) {
//         console.log(err);
//         return cb(null, err);
//     }
//     let Homeworkdetails = Homeworks.app.models.homework_details;
//     Homeworkdetails.update({ homework_id: homework_id }, { status: 1 }, function (err, res) {

//         let Homeworkfiles = Homeworks.app.models.homework_files;
//         Homeworkfiles.update({ homework_id: homework_id }, { status: 1 }, function (err, res) {
//             msg = { status: true, data: result }
//             return cb(null, msg);
//         });
//     });
// });
