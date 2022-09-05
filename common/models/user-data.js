'use strict';
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser')
const DIR = './uploads';
var FCM = require('fcm-push');
const request = require("request");
const SETTINGS = require('../../server/system-config');

module.exports = function (Userdata) {

    Userdata.userUpload = function (req, res, cb) {
        // console.log(req);
        fs.readFile(req, {
            encoding: 'utf-8'
        }, function (err, csvData) {
            if (err) {
                console.log(err);
            }

            csvParser(csvData, {
                delimiter: ','
            }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            });
        });
    }

    Userdata.remoteMethod(
        'userUpload',
        {
            http: { path: '/userUpload', verb: 'post' },
            description: 'Upload Users',
            accepts: [
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: { arg: 'response', type: 'json' }
        }
    );

    Userdata.getStudentList = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        let params;
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

        var ds = Userdata.dataSource;

        var countSql = `SELECT count(*) as totalCount
        FROM user_data ud
        join quiz_user qu on qu.email = ud.email
        
        where ud.school_id = ${school_id} 
        and ud.class_id = ${class_id} 
        and ud.section_id = ${section_id}`

        var sql = `SELECT qu.id, ud.studentName
        FROM user_data ud
        join quiz_user qu on qu.email = ud.email
        
        where ud.school_id = ${school_id} 
        and ud.class_id = ${class_id} 
        and ud.section_id = ${section_id}
        ORDER BY ud.studentName ASC LIMIT ${offset},${limit};`

        ds.connector.query(countSql, params, function (err, countData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            ds.connector.query(sql, params, function (err, quizData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                let countVal = 0;

                if (countData.length > 0) {
                    countVal = countData[0].totalCount;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_students = countVal;
                contentData.data = quizData;
                cb(null, contentData);
            });
        });

    }

    Userdata.remoteMethod(
        'getStudentList',
        {
            http: { path: '/getStudentList', verb: 'post' },
            description: 'Get Students of school class section',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userdata.getUsers = function (data, cb) {
        let msg = {};
        let params;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = '';
        if (school_id === undefined) {
            msg.status = false;
            msg.message = "Please provide school id.";
            return cb(null, msg);
        }

        if (class_id === undefined) {
            msg.status = false;
            msg.message = "Please provide class id.";
            return cb(null, msg);
        }

        if (section_id !== undefined) {
            cond += ' and ud.section_id=' + section_id;
        }

        // Userdata.find({
        //     where: {
        //         school_id: school_id,
        //         class_id: class_id,
        //         section_id: section_id
        //     }
        // }, function(err, userData) {
        //     if(err) {
        //         msg.status = false;
        //         msg.message = "Error! Please try again.";
        //         return cb(null, msg);
        //     } else {
        //         msg.status = true;
        //         msg.data = userData;
        //         msg.message = "";
        //         return cb(null, msg);
        //     }
        // });

        var ds = Userdata.dataSource;

        var countSql = `SELECT count(*) as totalCount
        FROM user_data ud
        join quiz_user qu on qu.email = ud.email
        
        where ud.school_id = ${school_id} 
        and ud.class_id = ${class_id} 
        ${cond}`

        var sql = `SELECT qu.id as user_id, ud.email, ud.id, ud.rollNumber, ud.studentName,
        ud.studentContactNo, ud.school_id,ud.class_id, ud.section_id, ud.city, ud.publishDate,
        ud.user_type, ud.created_on
        FROM user_data ud
        join quiz_user qu on qu.email = ud.email
        
        where ud.school_id = ${school_id} 
        and ud.class_id = ${class_id} 
        ${cond}
        ORDER BY ud.studentName ASC LIMIT ${offset},${limit};`
        // console.log(countSql);
        ds.connector.query(countSql, params, function (err, countData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            ds.connector.query(sql, params, function (err, userData) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                let countVal = 0;

                if (countData.length > 0) {
                    countVal = countData[0].totalCount;
                }
                let contentData = {};
                contentData.status = true;
                contentData.total_students = countVal;
                contentData.data = userData;
                cb(null, contentData);
            });
        });

    }

    Userdata.remoteMethod(
        'getUsers',
        {
            http: { path: '/getusers', verb: 'post' },
            description: 'Get school users',
            accepts: [
                { arg: 'data', type: 'object', required: true, http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userdata.getUsersData = function (data, cb) {
        // console.log(data);
        let msg = {};
        let cond = {};
        let subjectCond = {};
        let studentName = (data.studentName == undefined || data.studentName == null || data.studentName == '') ? undefined : new RegExp(data.studentName, "i");
        let rollNumber = (data.rollNumber == undefined || data.rollNumber == null || data.rollNumber == '') ? undefined : data.rollNumber;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : new RegExp(data.email, "i");
        let studentContactNo = (data.studentContactNo == undefined || data.studentContactNo == null || data.studentContactNo == '') ? undefined : new RegExp(data.studentContactNo, "i");
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;

        let user_id = (data.user_id == undefined || data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        cond = {
            studentName: studentName,
            rollNumber: rollNumber,
            email: email,
            studentContactNo: studentContactNo
        };
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
            subjectCond.subject_id = { inq: subject_id }
        }
        Userdata.find({ where: cond }, function (err, total_students) {
            Userdata.find({
                where: cond,
                include: [
                    {
                        relation: 'userAssignSub',
                        scope: {
                            where: subjectCond
                        }
                    }
                ],
                limit: limit, skip: offset
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = "Invalid Data";
                    return cb(null, msg);
                }
                msg.status = true;
                msg.data = res;
                msg.totalCount = total_students.length;
                return cb(null, msg);
            })
        })

    }

    Userdata.remoteMethod(
        'getUsersData',
        {
            http: { path: '/getUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Userdata.addUsersData = async function (data, cb) {
        let msg = {};
        let studentName = (data.studentName == undefined || data.studentName == null || data.studentName == '') ? undefined : data.studentName;
        let rollNumber = (data.rollNumber == undefined || data.rollNumber == null || data.rollNumber == '') ? 0 : data.rollNumber;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let studentContactNo = (data.studentContactNo == undefined || data.studentContactNo == null || data.studentContactNo == '') ? undefined : data.studentContactNo;
        let city = (data.city == undefined || data.city == null || data.city == '') ? undefined : data.city;
        let user_type = (data.user_type == undefined || data.user_type == null) ? undefined : data.user_type;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let zoom_id = (data.zoom_id == undefined || data.zoom_id == null || data.zoom_id == '') ? '' : data.zoom_id;
        let zoom_pass = (data.zoom_pass == undefined || data.zoom_pass == null || data.zoom_pass == '') ? '' : data.zoom_pass;
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;

        try {
            if (studentName == undefined) {        // uses only in case of create new user
                msg.status = false;
                msg.message = "Please provide the student Name";
                return msg;
            }

            if (email == undefined) {
                msg.status = false;
                msg.message = "Please provide the email";
                return msg;
            }

            if (studentContactNo == undefined) {
                msg.status = false;
                msg.message = "Please provide the student Contact No";
                return msg;
            }

            if (user_type == undefined) {
                msg.status = false;
                msg.message = "Please provide the user type";
                return msg;
            }

            if (school_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the school id";
                return msg;
            }

            if (class_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the class id";
                return msg;
            }

            if (section_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the section id";
                return msg;
            }

            if (subject_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the subject id";
                return msg;
            }

            let quizUser = await getUserId(email);
            if (quizUser.status) {
                let addRes = await addUserData(studentName, rollNumber, email, studentContactNo, city,
                    user_type, school_id, class_id, section_id, subject_id, quizUser.data, zoom_id, zoom_pass, status);
                await addschoolData(studentName, rollNumber, email, studentContactNo, city,
                    user_type, school_id, class_id, section_id, subject_id, quizUser.data, created_by, status)
                // await addQuizAppUserData(studentName, rollNumber, email, studentContactNo, city, school_id, class_id, section_id);
                // await updateLiferayUser(quizUser.data);
                return addRes;
            } else {
                return quizUser;
            }
        } catch (error) {
            return error;
        }



    }

    Userdata.remoteMethod(
        'addUsersData',
        {
            http: { path: '/addUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUserId = (email) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Quizuser = Userdata.app.models.quiz_user;
            Quizuser.findOne({ where: { email: email } }, function (err, result) {
                if (err) { reject(err); }
                if (result) {
                    Userdata.findOne({ where: { email: email } }, function (err, res) {
                        if (err) { reject(err); }
                        if (res) {
                            msg.status = false;
                            msg.message = "User already Exists";
                            msg.data = res;
                            resolve(msg);
                        } else {
                            msg.status = true;
                            msg.message = "User added successfully";
                            msg.data = result;
                            resolve(msg);
                        }
                    });
                } else {
                    msg.status = false;
                    msg.message = "User is not registered"
                    msg.data = result;
                    resolve(msg);
                }
            });
        });
    }

    let addUserData = (studentName, rollNumber, email, studentContactNo, city, user_type,
        school_id, class_id, section_id, subject_id, quizUser, zoom_id, zoom_pass, status) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Userassignedsubjects = Userdata.app.models.user_assigned_subjects;
            let Quizuser = Userdata.app.models.quiz_user;
            school_id.forEach((schools_id) => {
                class_id.forEach((classes_id) => {
                    section_id.forEach((sections_id) => {
                        let Classsections = Userdata.app.models.class_sections;
                        Classsections.find({ where: { class_id: classes_id } }, function (err, classRes) {
                            let tempSectionIds = []
                            classRes.forEach((obj) => { tempSectionIds.push(obj.id); });
                            let found = tempSectionIds.find(element => element == sections_id);
                            let userDataObj = {
                                studentName: studentName,
                                studentContactNo: studentContactNo,
                                email: email,
                                rollNumber: rollNumber,
                                school_id: schools_id,
                                class_id: classes_id,
                                section_id: sections_id,
                                city: city,
                                user_id: quizUser.id,
                                user_type: user_type,
                                status: status
                            }
                            // console.log(userDataObj);
                            if (found) {
                                Userdata.upsert(userDataObj, function (err, res) {
                                    if (err) {
                                        console.log(err);
                                        msg.status = false;
                                        msg.message = err;
                                        reject(msg);
                                    }
                                });
                            }
                        });
                    });
                });
            });

            subject_id.forEach((subjects_id) => {
                let assignSubObj = {
                    user_id: quizUser.id,
                    subject_id: subjects_id,
                    status: 1,
                    paidStatus: 0
                }
                // console.log(assignSubObj);
                Userassignedsubjects.upsert(assignSubObj, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                });
            });

            Quizuser.update(
                { id: quizUser.id },
                { zoom_id: zoom_id, zoom_pass: zoom_pass }, function (err, res) {
                    if (err) {
                        reject(err);
                    }
                });
            msg.status = true;
            msg.message = "User Added Successfully";
            resolve(msg);
        });
    }

    let addschoolData = (studentName, rollNumber, email, studentContactNo, city,
        user_type, school_id, class_id, section_id, subject_id, quizUser, created_by, status) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Schooluserdata = Userdata.app.models.school_user_data;
            let Schooluserclasses = Userdata.app.models.school_user_classes;
            let userDataObj = {
                studentName: studentName,
                studentContactNo: studentContactNo,
                email: email,
                rollNumber: rollNumber,
                city: city,
                user_id: quizUser.id,
                user_type: user_type,
                status: status,
                created_by: created_by,
                created_on: new Date()
            }
            Schooluserdata.upsert(userDataObj, function (err, res) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    reject(msg);
                }
                school_id.forEach((schools_id) => {
                    class_id.forEach((classes_id) => {
                        section_id.forEach((sections_id) => {
                            let Classsections = Userdata.app.models.class_sections;
                            Classsections.find({ where: { class_id: classes_id } }, function (err, classRes) {
                                let tempSectionIds = []
                                classRes.forEach((obj) => { tempSectionIds.push(obj.id); });
                                let found = tempSectionIds.find(element => element == sections_id);
                                // console.log(userDataObj);
                                if (found) {
                                    subject_id.forEach((subjects_id) => {
                                        let userschoolObj = {
                                            school_data_id: res.id,
                                            school_id: schools_id,
                                            class_id: classes_id,
                                            section_id: sections_id,
                                            subject_id: subjects_id,
                                            user_id: quizUser.id
                                        }
                                        Schooluserclasses.upsert(userschoolObj, function (err, res) {
                                            if (err) {
                                                console.log(err);
                                                msg.status = false;
                                                msg.message = err.message;
                                                reject(msg);
                                            }
                                        });
                                    })
                                }
                            });

                        });
                    });
                });
                resolve();
            });
        })
    }

    let addQuizAppUserData = (studentName, rollNumber, email, studentContactNo, city, school_id, class_id, section_id) => {
        return new Promise((resolve, reject) => {
            let schools = Userdata.app.models.schools;
            let Classsections = Userdata.app.models.class_sections;
            schools.findOne({ where: { id: { inq: school_id } } }, function (err, res) {
                Classsections.findOne({
                    where: { id: { inq: section_id } },
                    include: [
                        {
                            relation: "class_section",
                            scope: {
                                where: { status: 1 }
                            }
                        }
                    ]
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        reject(err.message);
                    }
                    // console.log(result);
                    let quizAppUrl = `http://support.marksharks.com:5002/adduserdata`;
                    // console.log(result.toJSON().class_section);
                    let section_name = result.toJSON().class_section.section_name;
                    let userData = {
                        customerName: studentName,
                        customerNumber: studentContactNo,
                        email: email,
                        rollNumber: rollNumber,
                        studentContactNo: studentContactNo,
                        schoolName: res.school_name,
                        schoolCode: res.school_code,
                        schoolPinCode: 0,
                        class: "Grade " + class_id,
                        section: section_name,
                        city: city
                    }
                    // console.log(userData);
                    request.post({
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "url": quizAppUrl,
                        "json": userData
                    }, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err.message);
                        }
                        // console.log(res.body);
                        if (res) {
                            if (res.body) {
                                if (res.body.status) {
                                    resolve(res.body);
                                } else {
                                    reject({ status: false, message: res.body.message });
                                }
                            }
                        } else {
                            reject({ status: false, message: "Quiz app not running." });
                        }
                    }
                    );
                })
            })
        })

    }

    Userdata.sendNotification = async function (data, cb) {
        let msg = {};
        let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '' ? undefined : data.contactNumber.split(','));
        let email = (data.email == undefined || data.email == null || data.email == '' ? undefined : data.email.split(','));
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' || data.school_id.length < 1 ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' || data.section_id.length < 1 ? undefined : data.section_id);
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '' || data.subject_id.length < 1 ? undefined : data.subject_id);
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let webNotify = false;
        let cond = [];
        let userCond = [];
        // console.log(data);
        if (school_id !== undefined && !school_id.includes('0')) {
            userCond.push({ status: 1 });
        }

        try {
            if (title === undefined) {
                msg = {
                    status: false,
                    message: "Please provide title"
                };
                return msg;
            }

            if (message === undefined) {
                msg = {
                    status: false,
                    message: "Please provide message"
                };
                return msg;
            }

            if (school_id !== undefined) {
                cond.push({ school_id: { inq: school_id } });
            }

            if (class_id !== undefined) {
                cond.push({ class_id: { inq: class_id } });
            }

            if (section_id !== undefined) {
                cond.push({ section_id: { inq: section_id } });
            }

            if (subject_id !== undefined) {
                cond.push({ subject_id: { inq: subject_id } });
            }

            if (contactNumber !== undefined && contactNumber.length > 0) {
                userCond.push({ contactNumber: { inq: contactNumber } });
            }

            if (email !== undefined && email.length > 0) {
                userCond.push({ email: { inq: email } });
            }

            if (userCond.length < 1) {
                userCond.push({ contactNumber: { neq: '' } });
            }
            // console.log(userCond);
            let studentsData = await getStudents(cond, userCond, title, message, webNotify, class_id, deep_link, image_url);

            msg.status = true;
            msg.message = studentsData;
            return msg;
        } catch (err) {
            console.log(err);
            msg.status = false;
            msg.message = err.message;
            return msg;
        }
    }

    Userdata.remoteMethod(
        'sendNotification',
        {
            http: { path: '/sendNotification', verb: 'post' },
            description: 'Send push notification to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'object' },

        }
    );

    Userdata.sendWebNotification = async function (data, cb) {
        let msg = {};
        let contactNumber = (data.contactNumber == undefined || data.contactNumber == null || data.contactNumber == '' ? undefined : data.contactNumber.split(','));
        let email = (data.email == undefined || data.email == null || data.email == '' ? undefined : data.email.split(','));
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' || data.school_id.length < 1 ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' || data.section_id.length < 1 ? undefined : data.section_id);
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let sent_by = (data.sent_by == undefined || data.sent_by == null || data.sent_by == '' ? undefined : data.sent_by);
        let webNotify = true;
        let cond = [];
        let userCond = [];
        // console.log(data);
        if (school_id !== undefined && !school_id.includes('0')) {
            userCond.push({ status: 1 });
        }

        try {
            if (title === undefined) {
                msg = {
                    status: false,
                    message: "Please provide title"
                };
                return msg;
            }

            if (message === undefined) {
                msg = {
                    status: false,
                    message: "Please provide message"
                };
                return msg;
            }

            if (school_id !== undefined) {
                cond.push({ school_id: { inq: school_id } });
            }

            if (class_id !== undefined) {
                cond.push({ class_id: { inq: class_id } });
            }

            if (section_id !== undefined) {
                cond.push({ section_id: { inq: section_id } });
            }

            if (contactNumber !== undefined && contactNumber.length > 0) {
                userCond.push({ contactNumber: { inq: contactNumber } });
            }

            if (email !== undefined && email.length > 0) {
                userCond.push({ email: { inq: email } });
            }

            if (userCond.length < 1) {
                userCond.push({ contactNumber: { neq: '' } });
            }
            // console.log(userCond);
            let studentsData = await getStudents(cond, userCond, title, message, webNotify, class_id, deep_link, image_url, sent_by);

            msg.status = true;
            msg.message = studentsData;
            return msg;
        } catch (err) {
            console.log(err);
            msg.status = false;
            msg.message = err.message;
            return msg;
        }
    }

    Userdata.remoteMethod(
        'sendWebNotification',
        {
            http: { path: '/sendWebNotification', verb: 'post' },
            description: 'Send push notification to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'object' },

        }
    );

    let getStudents = (cond, userCond, title, message, webNotify, class_id, deep_link, image_url, sent_by) => {
        return new Promise((resolve, reject) => {
            // console.log(cond);
            let schoolUserData;
            if (webNotify) {
                schoolUserData = Userdata; //To send notification section-wise
            } else {
                schoolUserData = Userdata.app.models.school_user_classes; //To send notification subject-wise in app
            }

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
                                        fcmPush(fcmId, title, message, webNotify, deep_link, image_url, sent_to, class_id, sent_by);
                                        deep_link = deep_link.replace('/' + class_id + '/', '/{Grade}/'); //Replace in case of multiple class ids
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

    let fcmPush = (fcmId, title, message, webNotify, deep_link, image_url, sent_to, class_id, sent_by) => {
        var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
        var fcm = new FCM(serverKey);
        let logMsg = message;
        let module = "Others";
        let nwMessage = {
            title: title,
            message: message,
            deep_link: deep_link,
            image_url: image_url
        };
        if (image_url == '') {
            nwMessage = {
                title: title,
                message: message,
                deep_link: deep_link
            };
        }
        if (webNotify) {
            module = "Class Notification";
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
            let Pushnotificationlogs = Userdata.app.models.push_notification_logs;
            let logObj = {
                module: module,
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


    Userdata.getEditUsersData = function (data, cb) {
        let msg = {};
        let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
        if (id == undefined) {
            msg.status = false;
            msg.message = "Please provide the id";
            return cb(null, msg);
        }

        Userdata.findOne({
            where: { id: id },
            include: [
                {
                    relation: 'userAssignSub',
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
            let Userassignedsubjects = Userdata.app.models.user_assigned_subjects;
            // console.log(result);
            if (!result) {
                msg.status = false;
                msg.message = "User not found.";
                return cb(null, msg);
            }
            if (result.user_id) {
                Userassignedsubjects.findOne({ where: { user_id: result.user_id } }, function (err, res) {
                    msg.status = true;
                    msg.data = result;
                    msg.Userassignedsubjects = res
                    return cb(null, msg);
                });
            } else {
                msg.status = true;
                msg.data = result;
                return cb(null, msg);
            }
        });
    }

    Userdata.remoteMethod(
        'getEditUsersData',
        {
            http: { path: '/getEditUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Userdata.editUsersData = async function (data, cb) {
        let msg = {};
        let studentName = (data.studentName == undefined || data.studentName == null || data.studentName == '') ? undefined : data.studentName;
        let rollNumber = (data.rollNumber == undefined || data.rollNumber == null || data.rollNumber == '') ? undefined : data.rollNumber;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let studentContactNo = (data.studentContactNo == undefined || data.studentContactNo == null || data.studentContactNo == '') ? undefined : data.studentContactNo;
        let city = (data.city == undefined || data.city == null || data.city == '') ? undefined : data.city;
        let user_type = (data.user_type == undefined || data.user_type == null) ? undefined : data.user_type;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let id = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
        let zoom_id = (data.zoom_id == undefined || data.zoom_id == null || data.zoom_id == '') ? '' : data.zoom_id;
        let zoom_pass = (data.zoom_pass == undefined || data.zoom_pass == null || data.zoom_pass == '') ? '' : data.zoom_pass;
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;

        try {
            if (studentName == undefined) {        // uses only in case of create new user
                msg.status = false;
                msg.message = "Please provide the student Name";
                return msg;
            }

            if (rollNumber == undefined) {
                msg.status = false;
                msg.message = "Please provide the roll Number";
                return msg;
            }

            if (email == undefined) {
                msg.status = false;
                msg.message = "Please provide the email";
                return msg;
            }

            if (city == undefined) {
                msg.status = false;
                msg.message = "Please provide the city";
                return msg;
            }

            if (studentContactNo == undefined) {
                msg.status = false;
                msg.message = "Please provide the student Contact No";
                return msg;
            }

            if (user_type == undefined) {
                msg.status = false;
                msg.message = "Please provide the user type";
                return msg;
            }

            if (school_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the school id";
                return msg;
            }

            if (class_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the class id";
                return msg;
            }

            if (section_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the section id";
                return msg;
            }

            if (subject_id == undefined) {
                msg.status = false;
                msg.message = "Please provide the subject id";
                return msg;
            }

            let quizUserDataVal;
            let quizUser = await getUserIdEdit(email, id);
            if (quizUser.status) {
                quizUserDataVal = await editUserData(studentName, rollNumber, email, studentContactNo, city, user_type,
                    school_id, class_id, section_id, subject_id, quizUser.data, zoom_id, zoom_pass, status);
                await editschoolData(studentName, rollNumber, email, studentContactNo, city, user_type,
                    school_id, class_id, section_id, subject_id, quizUser.data, id, modified_by, status);
                // await addQuizAppUserData(studentName, rollNumber, email, studentContactNo, city, school_id, class_id, section_id);
                // await updateLiferayUser(quizUser.data);
            } else {
                quizUserDataVal = quizUser;
            }
            return quizUserDataVal;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    Userdata.remoteMethod(
        'editUsersData',
        {
            http: { path: '/editUsersData', verb: 'post' },
            description: 'Edit User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUserIdEdit = (email, id) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Quizuser = Userdata.app.models.quiz_user;
            let Schooluserdata = Userdata.app.models.school_user_data;
            Quizuser.findOne({ where: { email: email } }, function (err, result) {
                if (err) {
                    msg.status = false;
                    msg.message = err.message;
                    reject(msg);
                }
                if (result) {
                    Schooluserdata.findOne({ where: { email: email } }, function (err, res) {
                        if (err) {
                            msg.status = false;
                            msg.message = err.message;
                            reject(msg);
                        }

                        if (res && res.id != id) {
                            msg.status = false;
                            msg.message = "User already Exists. Please try again.";
                            resolve(msg);
                        } else {
                            msg.status = true;
                            msg.message = "User added successfully.";
                            msg.data = result;
                            resolve(msg);
                        }
                    });
                } else {
                    msg.status = false;
                    msg.message = "User is not registered";
                    reject(msg);
                }
            });
        });
    }

    let editUserData = (studentName, rollNumber, email, studentContactNo, city, user_type,
        school_id, class_id, section_id, subject_id, quizUser, zoom_id, zoom_pass, status) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Userassignedsubjects = Userdata.app.models.user_assigned_subjects;
            let Quizuser = Userdata.app.models.quiz_user;
            Userdata.destroyAll({ email: quizUser.email }, function (err, res) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    reject(msg);
                }
                school_id.forEach((schools_id) => {
                    class_id.forEach((classes_id) => {
                        section_id.forEach((sections_id) => {
                            if (sections_id != 0) {
                                let Classsections = Userdata.app.models.class_sections;
                                Classsections.find({ where: { class_id: classes_id } }, function (err, classRes) {
                                    let tempSectionIds = []
                                    classRes.forEach((obj) => { tempSectionIds.push(obj.id); });
                                    let found = tempSectionIds.find(element => element == sections_id);
                                    let userDataObj = {
                                        studentName: studentName,
                                        studentContactNo: studentContactNo,
                                        email: email,
                                        rollNumber: rollNumber,
                                        school_id: schools_id,
                                        class_id: classes_id,
                                        section_id: sections_id,
                                        city: city,
                                        user_id: quizUser.id,
                                        user_type: user_type,
                                        status: status
                                    }
                                    // console.log(userDataObj);
                                    if (found) {
                                        Userdata.upsert(userDataObj, function (err, res) {
                                            if (err) {
                                                console.log(err);
                                                msg.status = false;
                                                msg.message = err.message;
                                                reject(msg);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
            Userassignedsubjects.findOne({ where: { user_id: quizUser.id } }, function (err, subData) {
                if (err) {
                    msg.status = false;
                    msg.message = err.message;
                    reject(msg);
                }
                if (subData) {
                    Userassignedsubjects.update({ user_id: quizUser.id }, { status: 0 }, function (err, result) {
                        if (err) {
                            msg.status = false;
                            msg.message = err.message;
                            reject(msg);
                        }
                        subject_id.forEach(subjects_id => {
                            let assignSubObj = {
                                user_id: quizUser.id,
                                subject_id: subjects_id,
                                status: 1,
                                paidStatus: 0
                            }
                            Userassignedsubjects.upsertWithWhere({ user_id: quizUser.id, subject_id: subjects_id }, assignSubObj, function (err, res) {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                }
                            })
                        });
                        let quizUsrObj = {
                            zoom_id: zoom_id,
                            zoom_pass: zoom_pass,
                            contactNumber: studentContactNo,
                            status: status
                        }
                        Quizuser.update({ id: quizUser.id }, quizUsrObj, function (err, res) {
                            if (err) {
                                console.log(err);
                                msg.status = false;
                                msg.message = err.message;
                                reject(msg);
                            }
                        })
                    });
                } else {
                    subject_id.forEach(subjects_id => {
                        let assignSubObj = {
                            user_id: quizUser.id,
                            subject_id: subjects_id,
                            status: 1,
                            paidStatus: 0
                        }
                        Userassignedsubjects.upsertWithWhere({ user_id: quizUser.id, subject_id: subjects_id }, assignSubObj, function (err, res) {
                            if (err) {
                                reject(err);
                            }
                        })
                    });
                    let quizUsrObj = {
                        zoom_id: zoom_id,
                        zoom_pass: zoom_pass,
                        contactNumber: studentContactNo,
                    }
                    Quizuser.update({ id: quizUser.id }, quizUsrObj, function (err, res) {
                        if (err) {
                            console.log(err);
                            msg.status = false;
                            msg.message = err.message;
                            reject(msg);
                        }
                    })
                }
            })


            msg.status = true;
            msg.message = "User Edit successfully";
            resolve(msg);
        });
    }

    let editschoolData = (studentName, rollNumber, email, studentContactNo, city, user_type,
        school_id, class_id, section_id, subject_id, quizUser, school_data_id, modified_by, status) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let Schooluserdata = Userdata.app.models.school_user_data;
            let Schooluserclasses = Userdata.app.models.school_user_classes;
            let userDataObj = {
                studentName: studentName,
                studentContactNo: studentContactNo,
                email: email,
                rollNumber: rollNumber,
                city: city,
                user_id: quizUser.id,
                user_type: user_type,
                status: status,
                modified_by: modified_by
            }
            Schooluserdata.update({ id: school_data_id }, userDataObj, function (err, updresult) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    reject(msg);
                }

                Schooluserclasses.destroyAll({ school_data_id: school_data_id }, function (err, response) {
                    if (err) {
                        msg.status = false;
                        msg.message = err.message;
                        reject(msg);
                    }
                    school_id.forEach((schools_id) => {
                        class_id.forEach((classes_id) => {
                            section_id.forEach((sections_id) => {
                                let Classsections = Userdata.app.models.class_sections;
                                Classsections.find({ where: { class_id: classes_id } }, function (err, classRes) {
                                    let tempSectionIds = []
                                    classRes.forEach((obj) => { tempSectionIds.push(obj.id); });
                                    let found = tempSectionIds.find(element => element == sections_id);
                                    // console.log(userDataObj);
                                    if (found) {
                                        subject_id.forEach((subjects_id) => {
                                            let userDataObj = {
                                                school_data_id: school_data_id,
                                                school_id: schools_id,
                                                class_id: classes_id,
                                                section_id: sections_id,
                                                subject_id: subjects_id,
                                                user_id: quizUser.id
                                            }
                                            Schooluserclasses.upsert(userDataObj, function (err, res) {
                                                if (err) {
                                                    console.log(err);
                                                    msg.status = false;
                                                    msg.message = err.message;
                                                    reject(msg);
                                                }
                                            });
                                        })
                                    }
                                });
                            });
                        });
                    });
                });
            });
            msg.status = true;
            msg.message = "User Edit successfully";
            resolve(msg);
        });
    }

    let updateLiferayUser = (data) => {
        return new Promise((resolve, reject) => {
            let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
            let userId = (data.id == undefined || data.id == null || data.id == '') ? undefined : data.id;
            let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '') ? undefined : data.firstName;
            let lastName = (data.lastName == undefined || data.lastName == null || data.lastName == '') ? undefined : data.lastName;

            // let url = 'http://sp.marksharks.com/api/jsonws/markshark-services-portlet.msuser/update-student';
            let url = SETTINGS.SETTINGS.liferay_update_student;
            let schools = Userdata.app.models.schools;
            schools.findOne({ where: { id: { inq: school_id } } }, function (err, schResult) {
                if (err) {
                    console.log(err);
                    reject(err.message);
                }

                let userData = {
                    userId: userId,
                    email: email,
                    password: "",
                    firstName: firstName,
                    middleName: "",
                    lastName: lastName,
                    gender: "",
                    birthDayTimestamp: 0,
                    address1: "",
                    address2: "",
                    state: "",
                    pinCode: "",
                    homePhone: "",
                    school: schResult.school_name + "-" + schResult.school_code,
                    schoolCity: "",
                    schoolPinCode: "",
                    parentEmail: "",
                    parentTitle: "",
                    parentFirstName: "",
                    parentMiddleName: "",
                    parentLastName: "",
                    parentPhone: "",
                    deviceId: ""
                };
                let contentLength = userData.length;
                // console.log(subsriptionData);
                request.post({
                    "headers": {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Content-Length": contentLength
                    },
                    "url": url,
                    "form": userData
                }, function (err, res) {
                    if (err) {
                        console.log(err);
                        reject(err.message);
                    }
                    if (JSON.parse(res.body).exception) {
                        //  console.log(JSON.parse(res.body).exception);
                        // reject(JSON.parse(res.body).exception);
                        resolve(JSON.parse(res.body).exception);
                    } else {
                        resolve(email);
                    }
                });
            });
        });
    }


    Userdata.deleteUsersData = function (data, cb) {
        let msg = {};
        let school_data_id = (data.school_data_id == undefined || data.school_data_id == null || data.school_data_id == '') ? undefined : data.school_data_id;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let email = (data.email == undefined || data.user_id == null || data.email == '') ? undefined : data.email;
        if (user_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the user id";
            return cb(null, msg);
        }

        if (email == undefined) {
            msg.status = false;
            msg.message = "Please provide the email";
            return cb(null, msg);
        }

        if (school_data_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the school data id";
            return cb(null, msg);
        }

        let Userassignedsubjects = Userdata.app.models.user_assigned_subjects;
        let Schooluserdata = Userdata.app.models.school_user_data;
        let Schooluserclasses = Userdata.app.models.school_user_classes;

        Userdata.destroyAll({ email: email }, function (err, res) {
            if (err) {
                msg.status = false;
                msg.message = err.message;
                return cb(null, err);
            }
            Userassignedsubjects.update({ user_id: user_id }, { status: 0 }, function (err, res) {
                if (err) {
                    msg.status = false;
                    msg.message = err.message;
                    return cb(null, err);
                }
                Schooluserdata.destroyAll({ email: email }, function (err, res) {
                    if (err) {
                        msg.status = false;
                        msg.message = err.message;
                        return cb(null, err);
                    }
                    Schooluserclasses.destroyAll({ school_data_id: school_data_id }, function (err, res) {
                        if (err) {
                            msg.status = false;
                            msg.message = err.message;
                            return cb(null, err);
                        }
                        msg.status = true;
                        msg.message = "Deleted Successfully";
                        return cb(null, msg);
                    });
                });
            });
        });
    }

    Userdata.remoteMethod(
        'deleteUsersData',
        {
            http: { path: '/deleteUsersData', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Userdata.homeWorkUsers = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '') ? undefined : data.homework_id;

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

        if (homework_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the homework id";
            return msg;
        }

        // let Homeworkdetails = Userdata.app.models.homework_details;
        // Homeworkdetails.find({ where: { homework_id: homework_id } }, function (err, result) {
        //     if (err) { return cb(null, err); }
        //     let school_id = [];
        //     let class_id = [];
        //     let section_id = [];
        //     let response = JSON.parse(JSON.stringify(result));
        //     response.forEach(element => {
        //         school_id.push(element.school_id);
        //         class_id.push(element.class_id);
        //         section_id.push(element.section_id);
        //     });
        //     school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
        //     class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
        //     section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);

        Userdata.find({
            where: {
                school_id: { inq: school_id },
                class_id: { inq: class_id },
                section_id: { inq: section_id },
                user_type: 0
            },
            include: [
                {
                    relation: 'quiz_user_data',
                    scope: {
                        where: { status: 1 },
                        fields: ['id'],
                        include: [
                            {
                                relation: 'homeWorkSubmit',
                                scope: {
                                    type: "count",
                                    where: {
                                        homework_id: homework_id,
                                        status: 1
                                    }
                                }
                            }
                        ]
                    },

                },
                {
                    relation: 'class',
                    scope: {
                        fields: ['class_name'],
                    }
                },
                {
                    relation: 'section',
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
                }
            ]
        }, function (err, res) {
            if (err) {
                msg = { status: false, message: "Invalid Data" }
                return cb(null, msg);
            }
            msg = { status: true, data: res }
            return cb(null, msg);
        });
        // })
    }

    Userdata.remoteMethod(
        'homeWorkUsers',
        {
            http: { path: '/homeWorkUsers', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userdata.schoolQuizReport = function (data, cb) {
        let msg = {};
        let cond = '';
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let from_date = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let to_date = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the school id";
            return cb(null, msg);
        } else {
            cond = cond + " and ud.school_id = " + school_id;
        }

        if (from_date !== undefined) {
            //let frmDate = new Date(fromDate);
            let frmDate = dateFormatter(from_date);
            frmDate = new Date(frmDate);
            from_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (to_date !== undefined) {
            //let tDate = new Date(toDate);
            let tDate = dateFormatter(to_date);
            tDate = new Date(tDate);
            to_date = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
        }

        var today = dateFormatter(new Date());
        today = new Date(today);
        if (from_date !== undefined && to_date !== undefined) {
            cond = cond + " and aqs.attempted_on >= '" + from_date + "'" + " and aqs.attempted_on <= '" + to_date + "'"
        } else if (from_date !== undefined && to_date == undefined) {
            to_date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            cond = cond + " and aqs.attempted_on >= '" + from_date + "'" + " and aqs.attempted_on <= '" + to_date + "'"
        } else if (from_date == undefined && to_date !== undefined) {
            cond = cond + " and aqs.attempted_on <= '" + to_date + "'"
        }

        var ds = Userdata.dataSource;
        let params;

        var sql = `SELECT aqs.user_id, qu.id,
        sum(aqs.total_attempted) as total_attempted,
        sum(aqs.total_correct) as total_correct,
        sum(aqs.total_incorrect) as total_incorrect,
        sum(aqs.total_skipped) as total_skipped,
        COUNT(aqs.id) as totalQuiz,
        aqs.time_spent, sc.school_name, c.class_name, s.section_name, ud.studentName, 
        ud.studentContactNo, ud.email,
        (SUM(total_correct)/(SUM(total_correct)+SUM(total_incorrect)+SUM(total_skipped)))*100 as percentage
        FROM attempted_quiz_set aqs
        join quiz_user qu ON qu.id = aqs.user_id
        join user_data ud on qu.id = ud.user_id
        join schools sc on ud.school_id = sc.id
        join classes c on ud.class_id = c.id
        join class_sections cs on ud.section_id = cs.id
        join sections s on cs.section_id = s.id
        where 1=1 and qu.status = 1 and qu.userType = 0
        and sc.status = 1 and c.status = 1 and cs.status =1 and s.status = 1
        ${cond} group by qu.id
        ORDER BY cs.id`

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            // console.log(quizData);
            msg = { status: true, data: quizData }
            return cb(null, msg);
        });
    }

    Userdata.remoteMethod(
        
        'schoolQuizReport',
        {
            http: { path: '/schoolQuizReport', verb: 'post' },
            description: 'Get User Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userdata.schoolPostQuizReport = function (data, cb) {
        let msg = {};
        let cond = '';
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let from_date = (data.from_date == undefined || data.from_date == null || data.from_date == '' ? undefined : data.from_date);
        let to_date = (data.to_date == undefined || data.to_date == null || data.to_date == '' ? undefined : data.to_date);

        if (school_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the school id";
            return cb(null, msg);
        } else {
            cond = cond + " and ud.school_id = " + school_id;
        }

        if (from_date !== undefined) {
            //let frmDate = new Date(fromDate);
            let frmDate = dateFormatter(from_date);
            frmDate = new Date(frmDate);
            from_date = frmDate.getFullYear() + "-" + (frmDate.getMonth() + 1) + "-" + frmDate.getDate() + " 00:00:00";
        }

        if (to_date !== undefined) {
            //let tDate = new Date(toDate);
            let tDate = dateFormatter(to_date);
            tDate = new Date(tDate);
            to_date = tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() + " 23:59:59";
        }

        var today = dateFormatter(new Date());
        today = new Date(today);
        if (from_date !== undefined && to_date !== undefined) {
            cond = cond + " and aqs.attempted_on >= '" + from_date + "'" + " and aqs.attempted_on <= '" + to_date + "'"
        } else if (from_date !== undefined && to_date == undefined) {
            to_date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            cond = cond + " and aqs.attempted_on >= '" + from_date + "'" + " and aqs.attempted_on <= '" + to_date + "'"
        } else if (from_date == undefined && to_date !== undefined) {
            cond = cond + " and aqs.attempted_on <= '" + to_date + "'"
        }

        var ds = Userdata.dataSource;
        let params;

        var sql = `SELECT aqs.user_id, qu.id,
        sum(aqs.total_attempted) as total_attempted,
        sum(aqs.total_correct) as total_correct,
        sum(aqs.total_incorrect) as total_incorrect,
        sum(aqs.total_skipped) as total_skipped,
        COUNT(aqs.id) as totalQuiz,
        aqs.time_spent, sc.school_name, c.class_name, s.section_name, ud.studentName, 
        ud.studentContactNo, ud.email,
        (SUM(total_correct)/(SUM(total_correct)+SUM(total_incorrect)+SUM(total_skipped)))*100 as percentage
        FROM post_attempted_quiz_set aqs
        join quiz_user qu ON qu.id = aqs.user_id
        join user_data ud on qu.id = ud.user_id
        join schools sc on ud.school_id = sc.id
        join classes c on ud.class_id = c.id
        join class_sections cs on ud.section_id = cs.id
        join sections s on cs.section_id = s.id
        where 1=1 and qu.status = 1 and qu.userType = 0
        and sc.status = 1 and c.status = 1 and cs.status =1 and s.status = 1
        ${cond} group by qu.id
        ORDER BY cs.id`

        ds.connector.query(sql, params, function (err, quizData) {
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = "Invalid Data";
                return cb(null, msg);
            }
            // console.log(quizData);
            msg = { status: true, data: quizData }
            return cb(null, msg);
        });
    }

    Userdata.remoteMethod(
        
        'schoolPostQuizReport',
        {
            http: { path: '/schoolPostQuizReport', verb: 'post' },
            description: 'Get User Post quiz Details',
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

    Userdata.userStatus = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let status = (data.status == undefined || data.status == null || data.status == '') ? undefined : data.status;

        if (user_id == undefined) {
            msg.status = false;
            msg.message = "Please provide the user id";
            return cb(null, msg);
        }

        if (status == undefined) {
            msg.status = false;
            msg.message = "Please provide the status";
            return cb(null, msg);
        }
        let Quizuser = Userdata.app.models.quiz_user;
        let Schooluserdata = Userdata.app.models.school_user_data;

        Userdata.update({user_id: user_id}, {status: status}, function(err,result){
            if(err){
                msg = { status: false, message: err.message }
                return cb(null, msg);
            }
            Schooluserdata.update({user_id: user_id}, {status: status}, function(err,res){
                if(err){
                    msg = { status: false, message: err.message }
                    return cb(null, msg);
                }
                Quizuser.update({id: user_id}, {status: status}, function(err,response){
                    if(err){
                        msg = { status: false, message: err.message }
                        return cb(null, msg);
                    }
                    msg = { status: true, data: response }
                    return cb(null, msg);
                });
            })
        })
    }

    Userdata.remoteMethod(
        'userStatus',
        {
            http: { path: '/userStatus', verb: 'post' },
            description: 'change user status',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Userdata.getTutorStudent = function (data, cb) {
        // console.log(data);
        let msg = {};
        let cond = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let limit = (data == undefined || data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data == undefined || data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        cond.user_type = 0;
        if (school_id == undefined) {
            msg = {status: false, message: "Please provide the school id"};
            return cb(null, msg);
        }else{
            cond.school_id = { inq: school_id }
        }

        if (class_id == undefined) {
            msg = {status: false, message: "Please provide the class id"};
            return cb(null, msg);
        }else{
            cond.class_id = { inq: class_id }
        }

        if (section_id == undefined) {
            msg = {status: false, message: "Please provide the section id"};
            return cb(null, msg);
        }else{
            cond.section_id = { inq: section_id }
        }

        Userdata.find({ where: cond }, function (err, total_students) {
            Userdata.find({
                where: cond,
                limit: limit,
                skip: offset,
                include: [
                    {
                        relation: 'class',
                        scope: {
                            fields: ['class_name'],
                        }
                    },
                    {
                        relation: 'section',
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
                    }
                ]
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    msg = {status: false, message: "Invalid Data"};
                    return cb(null, msg);
                }
                msg = {status: true, data: res, totalCount: total_students.length};
                return cb(null, msg);
            })
        })

    }

    Userdata.remoteMethod(
        'getTutorStudent',
        {
            http: { path: '/getTutorStudent', verb: 'post' },
            description: 'Get Tutor Student Details',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
