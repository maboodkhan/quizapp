'use strict';
const schedule = require('node-schedule');
var FCM = require('fcm-push');
const request = require("request");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const SETTINGS = require('../../server/system-config');

module.exports = function (Pushnotifications) {

    Pushnotifications.getnotifications = async function (data, cb) {
        let msg = {};
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' || data.school_id.length < 1 ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
        let section_id = (data.school_id == undefined || data.section_id == null || data.section_id == '' || data.section_id.length < 1 ? undefined : data.section_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let scheduleSchool = (data.scheduleSchool == undefined || data.scheduleSchool == null || data.scheduleSchool == '' ? undefined : data.scheduleSchool);
        let user_id = [];
        let showAllnoti = ['superadmin'];

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        try {
            user_id.push(created_by);
            let userType = await getUserType(created_by);
            if (showAllnoti.includes(userType.toJSON().user_Type.type_name)) {
                user_id = [];
            } else {
                let assignedArr = []
                await allCreatedByLower(user_id, assignedArr);
                user_id = assignedArr;
                user_id.push(created_by);
            }
            let result = await getNotifySql(user_id, school_id, class_id, section_id, limit, offset, scheduleSchool)
            return result;
        } catch (error) {
            throw error;
        }
    }

    Pushnotifications.remoteMethod(
        'getnotifications',
        {
            http: { path: '/getnotifications', verb: 'post' },
            description: 'Get Notifications',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUserType = (created_by) => {
        return new Promise((resolve, reject) => {
            let user = Pushnotifications.app.models.user;
            user.findOne({
                where: { id: created_by },
                include: [
                    {
                        relation: "user_Type",
                        scope: { where: { status: 1 } }
                    }
                ]
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result)
            });
        })
    }

    let allCreatedByLower = (created_by, assignedArr) => {
        return new Promise((resolve, reject) => {
            let user = Pushnotifications.app.models.user;
            let createdIds = [];
            user.find({ where: { assigned_to: { inq: created_by } } }, function (err, result) {
                if (err) {
                    reject(err);
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

    let getNotifySql = (user_id, school_id, class_id, section_id, limit, offset, scheduleSchool) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            let cond = '';
            if (scheduleSchool == undefined) {
                cond = " and pnd.school_id = 0"
            } else {
                if (user_id.length > 0) {
                    cond = cond + " and pn.created_by IN(" + user_id.join() + ")";
                }
                if (school_id !== undefined) {
                    cond = cond + " and pnd.school_id IN(" + school_id.join() + ")";
                }else{
                    cond = cond + " and pnd.school_id != 0"
                }
                if (class_id !== undefined) {
                    cond = cond + " and pnd.class_id IN(" + class_id.join() + ")";
                }
                if (section_id !== undefined) {
                    cond = cond + " and pnd.section_id IN(" + section_id.join() + ")";
                }
            }

            // if (user_id.length > 0) {
            //     cond = cond + " and pn.created_by IN(" + user_id.join() + ")";
            // }
            var ds = Pushnotifications.dataSource;
            let params;

            var countSql = `SELECT pn.*, pnms.type_name as notificationType,
        pnm.type_name as subNotificationType
        FROM push_notification_details pnd
        join push_notifications pn ON pn.id = pnd.push_notification_id
        join push_notification_master pnm ON pnm.id = pn.subNotificationTypeId
        join push_notification_master pnms ON pnms.id = pn.notificationTypeId
        where 1=1 and pn.status IN(1,2) ${cond}
        group by pnd.push_notification_id
        ORDER BY pn.id DESC`

            var sql = `SELECT pn.*, pnms.type_name as notificationType,
        pnm.type_name as subNotificationType, u.username
        FROM push_notification_details pnd
        join push_notifications pn ON pn.id = pnd.push_notification_id
        join push_notification_master pnm ON pnm.id = pn.subNotificationTypeId
        join push_notification_master pnms ON pnms.id = pn.notificationTypeId
        join user u ON u.id = pn.created_by 
        where 1=1 and pn.status IN(1,2) ${cond}
        group by pnd.push_notification_id
        ORDER BY pn.id DESC
        LIMIT ${offset},${limit};`

            ds.connector.query(countSql, params, function (err, totalNotifi) {
                if (err) {
                    msg = { status: false, message: err };
                    reject(msg);
                }
                ds.connector.query(sql, params, function (err, result) {
                    if (err) {
                        console.log(err);
                        msg = { status: false, message: err };
                        reject(msg);
                    }
                    msg = { status: true, data: result, total: totalNotifi.length };
                    resolve(msg);
                });
            });
        })
    }


    Pushnotifications.getNotificationById = function (data, cb) {
        let msg = {};
        let notification_id = (data.notification_id == undefined || data.notification_id == null || data.notification_id == '' ? undefined : data.notification_id);

        Pushnotifications.findOne({
            where: { id: notification_id },
            include: [
                {
                    relation: 'notificationDetails',
                    scope: {
                        where: { status: 1 }
                    }
                },
                {
                    relation: 'subNotificationType',
                    scope: {
                        where: { status: 1 }
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


    Pushnotifications.remoteMethod(
        'getNotificationById',
        {
            http: { path: '/getNotificationById', verb: 'post' },
            description: 'Get Notifications',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Pushnotifications.deleteNotification = function (data, cb) {
        let msg = {};
        let notification_id = (data.notification_id == undefined || data.notification_id == null || data.notification_id == '' ? undefined : data.notification_id);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let Pushnotificationdetails = Pushnotifications.app.models.push_notification_details;

        if (status == 1) {
            let uniqueJobName = notification_id;
            let current_job = schedule.scheduledJobs[uniqueJobName];
            // --(current_job);
            current_job.cancel();
        }
        Pushnotifications.destroyAll({ id: notification_id }, function (err, result) {
            if (err) { return cb(null, err) }
            Pushnotificationdetails.destroyAll({ push_notification_id: notification_id }, function (err, result) {
                if (err) { return cb(null, err); }
                msg = { status: true, data: result };
                return cb(null, msg);
            });
        });
    }


    Pushnotifications.remoteMethod(
        'deleteNotification',
        {
            http: { path: '/deleteNotification', verb: 'post' },
            description: 'delete Notifications',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Pushnotifications.addNotification = async function (data, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' || data.country_id.length < 1 ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' || data.school_id.length < 1 ? [0] : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
        let section_id = (data.school_id == undefined || data.section_id == null || data.section_id == '' || data.section_id.length < 1 ? [0] : data.section_id);
        let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
        let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
        let notificationTypeId = (data.notificationTypeId == undefined || data.notificationTypeId == null || data.notificationTypeId == '' ? undefined : data.notificationTypeId);
        let subNotificationTypeId = (data.subNotificationTypeId == undefined || data.subNotificationTypeId == null || data.subNotificationTypeId == '' ? undefined : data.subNotificationTypeId);
        let notifyScheduleDate = (data.notifyScheduleDate == undefined || data.notifyScheduleDate == null || data.notifyScheduleDate == '' ? null : data.notifyScheduleDate);
        let dayHourMinuts = (data.dayHourMinuts == undefined || data.dayHourMinuts == null || data.dayHourMinuts == '' ? undefined : data.dayHourMinuts);
        let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '' ? undefined : data.created_on);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let notification_id = (data.notification_id == undefined || data.notification_id == null || data.notification_id == '' ? 0 : data.notification_id);
        let userRegFromDate = (data.userRegFromDate == undefined || data.userRegFromDate == null || data.userRegFromDate == '' ? undefined : data.userRegFromDate);
        let userRegToDate = (data.userRegToDate == undefined || data.userRegToDate == null || data.userRegToDate == '' ? undefined : data.userRegToDate);
        let emailMessage = (data.emailMessage == undefined || data.emailMessage == null || data.emailMessage == '' ? undefined : entities.encode(data.emailMessage));
        // let Pushnotificationdetails = Pushnotifications.app.models.push_notification_details;
        try {
            if (country_id == undefined) {
                msg.status = false;
                msg.message = "Please select a country";
                return msg;
            }

            if (class_id == undefined) {
                msg.status = false;
                msg.message = "Please select a class";
                return msg;
            }

            if (title == undefined) {
                msg.status = false;
                msg.message = "Please enter the title";
                return msg;
            }

            if (title == undefined) {
                msg.status = false;
                msg.message = "Please enter the title";
                return msg;
            }

            if (notificationTypeId == undefined) {
                msg.status = false;
                msg.message = "Please select a subscription type";
                return msg;
            }

            if (subNotificationTypeId == undefined) {
                msg.status = false;
                msg.message = "Please select the frequency";
                return msg;
            }

            if (userRegFromDate == undefined && userRegToDate != undefined) {
                msg.status = false;
                msg.message = "Please select the user Registration From Date";
                return msg;
            }

            if (created_by == undefined && modified_by == undefined) {
                msg.status = false;
                msg.message = "Invalid Data.";
                return msg;
            }
            if (userRegFromDate != undefined || userRegToDate != undefined) {
                let check = await checkRegDate(userRegFromDate, userRegToDate);
                if (!check.status) {
                    return check;
                }
            }

            let getCountryCodeVals = await getCountryCodes(country_id);
            let countryCodes = [];
            await getCountryCodeVals.forEach((countryVals) => {
                countryCodes.push(countryVals.countryCode);
            });
            data.countryCodes = countryCodes;
            let addNotificationDataVal = await addNotificationData(data);
            if (deep_link != '') {
                let appDeepLinkData = await appDeepLink(deep_link);
                deep_link = appDeepLinkData.deep_link;
                data.deep_link = deep_link;
            }
            notification_id = addNotificationDataVal.id;
            let deleteNotiDetails = await deleteNotificationDetails(notification_id);
            let addNotificationDetailsData = addNotificationDetails(notification_id, country_id, school_id, class_id, section_id, status);
            // console.log('new test')
            let subNotificationTypeVal = await subNotificationType(subNotificationTypeId);
            data.subNotificationTypeVal = subNotificationTypeVal;
            await scheduleJob(notification_id, data);
            msg = { status: true, data: addNotificationDataVal, message: "Notification schedule successfully" };
            return msg;
        } catch (error) {
            msg.status = false;
            msg.message = error;
            console.log(msg);
            return msg;
        }
    }


    Pushnotifications.remoteMethod(
        'addNotification',
        {
            http: { path: '/addNotification', verb: 'post' },
            description: 'add edit Notifications',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let checkRegDate = (userRegFromDate, userRegToDate) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            if (userRegToDate == undefined) {
                let toDate = dateFormatter(new Date());
                userRegToDate = new Date(toDate);
            } else {
                let toDate = dateFormatter(userRegToDate);
                userRegToDate = new Date(toDate);
            }
            let fromDate = dateFormatter(userRegFromDate);
            userRegFromDate = new Date(fromDate);
            let difference = userRegToDate.getTime() - userRegFromDate.getTime();
            difference = difference / (1000 * 3600 * 24);
            if (difference > 180 || difference < 0) {
                msg = { status: false, message: "Date difference should not be more than 6 months" }
                resolve(msg);
            } else {
                msg = { status: true, message: "Date difference is correct" }
                resolve(msg);
            }
        });
    };

    let getCountryCodes = (country_id) => {
        return new Promise((resolve, reject) => {
            let Countries = Pushnotifications.app.models.countries;
            Countries.find({ where: { id: { inq: [country_id] } } }, function (err, countryData) {
                if (err) {
                    reject(err.message);
                }
                resolve(countryData);
            });
        });
    };
    let addNotificationData = (data) => {
        return new Promise((resolve, reject) => {
            let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
            let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
            let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
            let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
            let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
            let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
            let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
            let notificationTypeId = (data.notificationTypeId == undefined || data.notificationTypeId == null || data.notificationTypeId == '' ? undefined : data.notificationTypeId);
            let subNotificationTypeId = (data.subNotificationTypeId == undefined || data.subNotificationTypeId == null || data.subNotificationTypeId == '' ? undefined : data.subNotificationTypeId);
            let notifyScheduleDate = (data.notifyScheduleDate == undefined || data.notifyScheduleDate == null || data.notifyScheduleDate == '' ? null : data.notifyScheduleDate);
            let dayHourMinuts = (data.dayHourMinuts == undefined || data.dayHourMinuts == null || data.dayHourMinuts == '' ? undefined : data.dayHourMinuts);
            let userRegFromDate = (data.userRegFromDate == undefined || data.userRegFromDate == null || data.userRegFromDate == '' ? undefined : data.userRegFromDate);
            let userRegToDate = (data.userRegToDate == undefined || data.userRegToDate == null || data.userRegToDate == '' ? undefined : data.userRegToDate);
            let created_on = (data.created_on == undefined || data.created_on == null || data.created_on == '' ? undefined : data.created_on);
            let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
            let notification_id = (data.notification_id == undefined || data.notification_id == null || data.notification_id == '' ? 0 : data.notification_id);
            let emailMessage = (data.emailMessage == undefined || data.emailMessage == null || data.emailMessage == '' ? undefined : entities.encode(data.emailMessage));
            let staffOnly = (data.staffOnly == undefined || data.staffOnly == null || data.staffOnly == '' ? 0 : 1);

            let saveObj = {
                notificationTypeId: notificationTypeId,
                subNotificationTypeId: subNotificationTypeId,
                notifyScheduleDate: notifyScheduleDate,
                title: title,
                message: message,
                emailMessage: emailMessage,
                deep_link: deep_link,
                image_url: image_url,
                status: status,
                created_by: created_by,
                modified_by: modified_by,
                created_on: created_on,
                userRegFromDate: userRegFromDate,
                userRegToDate: userRegToDate,
                staffOnly: staffOnly
            }

            if (dayHourMinuts) {
                let date = dateFormatter(dayHourMinuts);
                date = new Date(date);
                saveObj.dayHour = date.getHours();
                saveObj.dayMinutes = date.getMinutes();
            } else {
                saveObj.dayHour = null;
                saveObj.dayMinutes = null;
            }
            Pushnotifications.upsertWithWhere({ id: notification_id }, saveObj, function (err, res) {
                if (err) {
                    reject(err.message);
                }
                resolve(res);
            });
        });
    }

    let deleteNotificationDetails = (notification_id) => {
        return new Promise((resolve, reject) => {
            let Pushnotificationdetails = Pushnotifications.app.models.push_notification_details;
            Pushnotificationdetails.destroyAll({ push_notification_id: notification_id }, function (err, rVal) {
                if (err) {
                    reject(err.message);
                }
                resolve(rVal);
            });
        });
    }

    let addNotificationDetails = (notification_id, country_id, school_id, class_id, section_id, status) => {
        return new Promise((resolve, reject) => {
            let Pushnotificationdetails = Pushnotifications.app.models.push_notification_details;
            // class_id.forEach(classId => {
            country_id.forEach((countryId) => {
                school_id.forEach((schoolId) => {
                    class_id.forEach((classId) => {
                        section_id.forEach((sectionId) => {
                            let detailObj = {
                                country_id: countryId,
                                school_id: schoolId,
                                class_id: classId,
                                section_id: sectionId,
                                push_notification_id: notification_id,
                                status: status
                            }
                            Pushnotificationdetails.upsert(detailObj, function (err, result) {
                                if (err) {
                                    reject(err.message);
                                }
                                // resolve(result);
                            })
                        });
                    });
                })

            });
            // let detailObj = {
            //     country_id: countryId,
            //     class_id: classId,
            //     push_notification_id: notification_id,
            //     status: status
            // }
            // Pushnotificationdetails.upsert(detailObj, function (err, result) {
            //     if (err) {
            //         reject(err.message);
            //     }
            //     resolve(result);
            // })
            // });
        });
    }

    let getUsers = (data, userSubscriptionStatus) => {
        return new Promise((resolve, reject) => {
            // console.log(data);
            let Appuser = Pushnotifications.app.models.appUser;
            var ds = Appuser.dataSource;
            let params;
            let cond = '';
            let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' || data.school_id.length < 1 ? [0] : data.school_id);
            let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' || data.class_id.length < 1 ? undefined : data.class_id);
            let section_id = (data.school_id == undefined || data.section_id == null || data.section_id == '' || data.section_id.length < 1 ? [0] : data.section_id);
            let title = (data.title == undefined || data.title == null || data.title == '' ? undefined : data.title);
            let message = (data.message == undefined || data.message == null || data.message == '' ? undefined : data.message);
            let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
            let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
            let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
            let modified_by = (data.modified_by == undefined || data.modified_by == null || data.modified_by == '' ? undefined : data.modified_by);
            let from_date = (data.from_date !== null && data.from_date !== '' && data.from_date !== undefined) ? data.from_date + " 00:00:00" : undefined;
            let to_date = (data.to_date !== null && data.to_date !== '' && data.to_date !== undefined) ? data.to_date + " 23:59:59" : undefined;
            let customerNumber = (data.customerNumber !== null && data.customerNumber !== '' && data.customerNumber !== undefined) ? data.customerNumber : undefined;
            let email = (data.email !== null && data.email !== '' && data.email !== undefined) ? data.email : undefined;
            let countryCodes = (data.countryCodes !== null && data.countryCodes !== '' && data.countryCodes !== undefined) ? data.countryCodes : undefined;
            let subNotificationTypeId = (data.subNotificationTypeId !== null
                && data.subNotificationTypeId !== ''
                && data.subNotificationTypeId !== undefined) ? data.subNotificationTypeId : undefined;
            let userRegFromDate = (data.userRegFromDate == undefined || data.userRegFromDate == null || data.userRegFromDate == '' ? undefined : data.userRegFromDate);
            let userRegToDate = (data.userRegToDate == undefined || data.userRegToDate == null || data.userRegToDate == '' ? undefined : data.userRegToDate);
            let emailMessage = (data.emailMessage == undefined || data.emailMessage == null || data.emailMessage == '' ? undefined : entities.encode(data.emailMessage));
            let schoolStudent = (data.schoolStudent == undefined || data.schoolStudent == null || data.schoolStudent == '' ? undefined : data.schoolStudent);
            let staffOnly = (data.staffOnly == undefined || data.staffOnly == null || data.staffOnly == '' ? undefined : data.staffOnly);

            if (created_by == undefined) {
                created_by = modified_by;
            }

            if (customerNumber !== undefined) {
                cond = cond + " and p.number_ like '" + customerNumber + "'";
            }

            if (email !== undefined) {
                cond = cond + " and u.emailAddress like '%" + email + "%'";
            }

            if (countryCodes !== undefined) {
                let condStmt = [];
                countryCodes.forEach((countryCode) => {
                    condStmt.push("p.number_ like '%" + countryCode + "%'");
                });
                cond = cond + " and (" + condStmt.join(" OR ") + ")";
            }

            if (subNotificationTypeId == undefined) {
                reject('Please provide frequency');
            }

            if (userRegFromDate != undefined) {
                let fromDate = dateFormatter(userRegFromDate);
                fromDate = new Date(fromDate);
                userRegFromDate = fromDate.getFullYear() + "-" + (fromDate.getMonth() + 1) + "-" + fromDate.getDate() + " 00:00:00";
            }

            if (userRegToDate != undefined) {
                let toDate = dateFormatter(userRegToDate);
                toDate = new Date(toDate);
                userRegToDate = toDate.getFullYear() + "-" + (toDate.getMonth() + 1) + "-" + toDate.getDate() + " 23:59:59";
            }

            if (cond == '') {
                var today = dateFormatter(new Date());
                today = new Date(today);
                if (userRegFromDate !== undefined && userRegToDate !== undefined) {
                    cond = `and u.createDate>= '${userRegFromDate}' and u.createDate <= '${userRegToDate}'`;
                    // cond = cond + " and u.createDate >= '" + userRegFromDate + "'"
                    // cond = cond + " and u.createDate <= '" + userRegToDate + "'"
                }
                else if (userRegFromDate !== undefined && userRegToDate == undefined) {
                    userRegToDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
                    cond = `and u.createDate>= '${userRegFromDate}' and u.createDate <= '${userRegToDate}'`;
                    // cond = cond + " and u.createDate >= '" + userRegFromDate + "'"
                    // cond = cond + " and u.createDate <= '" + userRegToDate + "'"
                } else if (userRegFromDate == undefined && userRegToDate !== undefined) {
                    cond = `and u.createDate <= '${userRegToDate}'`;
                    // cond = cond + " and and u.createDate <= '" + userRegToDate + "'"
                } else {
                    let currDate = dateFormatter(new Date());
                    let currYear = currDate.getFullYear();
                    let curMonth = currDate.getMonth() + 1;
                    let lastMonthDay = currDate.getDate();
                    from_date = currYear + '-' + curMonth + '-' + "1" + " 00:00:00";
                    to_date = currYear + '-' + curMonth + '-' + lastMonthDay + " 23:59:59";
                    cond = `and u.createDate>= '${from_date}' and u.createDate <= '${to_date}'`;
                }

            }

            var sql = '';
            // console.log("userSubscriptionStatus",userSubscriptionStatus)
            if (userSubscriptionStatus == 'TRIAL') {
                subNotificationTypeId = String(subNotificationTypeId);
                if (subNotificationTypeId.search("TRIAL") > -1) {
                    let dateDiff = subNotificationTypeId.replace('TRIAL', '');
                    cond = cond + ' and DATEDIFF(CURDATE(),created_on)=' + dateDiff;
                }
                sql = `select p.userId from User_ u 
                    join Phone p on u.userId = p.userId 
                    left join Markshark_MSSubscriptionLedger l on u.userId = p.userId 
                    and u.userId = l.studentId 
                    left join Markshark_MSSubscriptionPlan sp on sp.id_ = l.subscriptionPlanId 
                    where (l.validUntil-(UNIX_TIMESTAMP(l.activatedOn)*1000))<(8*1000*24*60*60) 
                    ${cond}
                    and u.emailAddress NOT IN(select u.emailAddress from Phone p, User_ u, Markshark_MSSubscriptionLedger l 
                        where u.userId = p.userId and u.userId = l.studentId and l.validUntil>=(UNIX_TIMESTAMP()*1000) 
                        ${cond}
                        and (l.validUntil-(UNIX_TIMESTAMP(l.activatedOn)*1000))<(8*1000*24*60*60)) 
                        ORDER BY u.createDate DESC;`;
            } else if (userSubscriptionStatus == 'PAID') {
                sql = `select p.userId from Phone p, User_ u, Markshark_MSSubscriptionLedger l 
                    where u.userId = p.userId and u.userId = l.studentId and l.validUntil>(UNIX_TIMESTAMP()*1000) 
                    ${cond}
                    and ((l.validUntil-(UNIX_TIMESTAMP(l.activatedOn)*1000))>(8*1000*24*60*60))
                    ORDER BY u.createDate DESC;`;
            } else if (userSubscriptionStatus == 'EXPIRED') {
                sql = `select p.userId from User_ u 
                        join Phone p on u.userId = p.userId 
                        left join Markshark_MSSubscriptionLedger l on u.userId = p.userId and u.userId = l.studentId 
                        left join Markshark_MSSubscriptionPlan sp on sp.id_ = l.subscriptionPlanId 
                        where 1=1
                        ${cond}
                        and l.validUntil<(UNIX_TIMESTAMP()*1000)
                        ORDER BY u.createDate DESC;`;
            } else if (userSubscriptionStatus == 'EXPIRED-TRIAL') {
                sql = `select p.userId from User_ u 
                       join Phone p on u.userId = p.userId 
                       left join Markshark_MSSubscriptionLedger l on u.userId = p.userId and u.userId = l.studentId 
                       left join Markshark_MSSubscriptionPlan sp on sp.id_ = l.subscriptionPlanId 
                       where 1=1
                       ${cond}
                       and l.validUntil<(UNIX_TIMESTAMP()*1000)
                       and (l.validUntil-(UNIX_TIMESTAMP(l.activatedOn)*1000))<(8*1000*24*60*60)
                       ORDER BY u.createDate DESC;`;
            } else if (userSubscriptionStatus == 'ACTIVE-USERS') {
                sql = `select p.userId from User_ u 
                       join Phone p on u.userId = p.userId 
                       left join Markshark_MSSubscriptionLedger l on u.userId = p.userId and u.userId = l.studentId 
                       left join Markshark_MSSubscriptionPlan sp on sp.id_ = l.subscriptionPlanId 
                       where 1=1
                       ${cond}
                       and l.validUntil>(UNIX_TIMESTAMP()*1000)
                       ORDER BY u.createDate DESC;`;
            }
            // console.log(sql);
            ds.connector.query(sql, params, function (err, userData) {
                if (err) {

                    reject(err.message);
                }
                let cond = [];
                // let userCond = [];
                if (class_id !== undefined) {
                    cond.push({ class_id: { inq: class_id } });
                }
                let contentData = {};
                userData = JSON.stringify(userData);
                // console.log(JSON.parse(userData));
                userData = JSON.parse(userData);
                let userIds = [];
                userData.forEach((userVal) => {
                    userIds.push(userVal.userId);
                });

                if (userIds.length > 0) {
                    // console.log(userIds.length);
                    // userCond.push({ id: { inq: userIds } });
                    if (schoolStudent == undefined) {
                        getStudents(cond, userIds, title, message, emailMessage, deep_link, image_url, created_by);
                    } else {
                        if (staffOnly) {
                            getSchoolStaff(cond, userIds, school_id, class_id, section_id, title, message, emailMessage, deep_link, image_url, created_by);
                        } else {
                            getSchoolStudents(cond, userIds, school_id, class_id, section_id, title, message, emailMessage, deep_link, image_url, created_by);
                        }
                    }
                }

                contentData.status = true;
                // contentData.data = userData;                        
                resolve(contentData);
            });
        });
    }

    let scheduleJob = (notification_id, data) => {
        return new Promise((resolve, reject) => {
            let uniqueJobName = String(notification_id);

            let scheduleRuleValue = scheduleRule(data);


            // let current_job = schedule.scheduledJobs[uniqueJobName];
            // current_job.cancel(true);
            if (data.status == 1) {
                // {rule:'*/1 * * * *'}                
                if (schedule.scheduledJobs[uniqueJobName]) {
                    let current_job = schedule.scheduledJobs[uniqueJobName].cancel();
                }
                var j = schedule.scheduleJob(uniqueJobName, { rule: scheduleRuleValue }, async function (jobData) {
                    // console.log(jobData);
                    try {
                        let subNotificationTypeVal = await subNotificationType(data.notificationTypeId);
                        let userData;
                        let userSubscriptionStatus = subNotificationTypeVal.type_value;
                        userData = getUsers(data, userSubscriptionStatus);
                        // if(userSubscriptionStatus == 'TRIAL'){
                        //     userData = trialUsers(data, );
                        // } else if(subNotificationTypeVal.type_name == 'PAID'){
                        //     console.log('PAID');
                        // } else if(subNotificationTypeVal.type_name == 'EXPIRED'){
                        //     console.log('Expired');
                        // }
                    } catch (error) {
                        return error;
                    }
                });
            } else {
                let current_job = schedule.scheduledJobs[uniqueJobName];
                current_job.cancel()
            }
            resolve('Done');
        });
    }

    let scheduleRule = (data) => {
        let dayHourMinuts = (data.dayHourMinuts == undefined || data.dayHourMinuts == null || data.dayHourMinuts == '' ? undefined : data.dayHourMinuts);
        let subNotificationTypeVal = (data.subNotificationTypeVal !== null
            && data.subNotificationTypeVal !== ''
            && data.subNotificationTypeVal !== undefined) ? data.subNotificationTypeVal : undefined;
        let notifyScheduleDate = (data.notifyScheduleDate == undefined || data.notifyScheduleDate == null || data.notifyScheduleDate == '' ? null : data.notifyScheduleDate);
        let dayHour = null;
        let dayMinutes = null;

        if (dayHourMinuts) {
            // let date = dateFormatter(dayHourMinuts);
            let date = new Date(dayHourMinuts);
            dayHour = date.getHours();
            dayMinutes = date.getMinutes();
        }
        var rule;
        // rule.dayOfWeek = [0, new schedule.Range(4, 6)];
        if (subNotificationTypeVal.type_value == 0) { //For a specific schedule Date
            // let scheduleDate = dateFormatter(notifyScheduleDate);
            let scheduleDate = new Date(notifyScheduleDate);
            rule = scheduleDate;
        } else if (subNotificationTypeVal.type_value == 'MONTHLY-1ST-DAY') {
            // rule = new schedule.RecurrenceRule();
            // rule.month = [1,12];
            // rule.date = 1;
            // rule.hour = dayHour;
            // rule.minute = dayMinutes;
            // console.log(rule)
            rule = dayMinutes + ' ' + dayHour + ' ' + '1 * *';
        } else {
            rule = new schedule.RecurrenceRule();
            rule.hour = dayHour;
            rule.minute = dayMinutes;
        }
        return rule;
    }

    let subNotificationType = (type_id) => {
        return new Promise((resolve, reject) => {
            let notificationType = Pushnotifications.app.models.push_notification_master;
            notificationType.findOne({ where: { id: type_id } }, function (err, typeRes) {
                if (err) {
                    reject(err.message);
                }
                resolve(typeRes);
            });
        });
    }

    Pushnotifications.execUserType = async function (data, cb) {
        let msg = {};
        let notificationTypeId = (data.notificationTypeId == undefined || data.notificationTypeId == null || data.notificationTypeId == '' ? undefined : data.notificationTypeId);

        // let Pushnotificationdetails = Pushnotifications.app.models.push_notification_details;
        try {

            if (notificationTypeId == undefined) {
                msg = { status: false, message: "Please provide notification type id" };
                return msg;
            }

            let subNotificationTypeVal = await subNotificationType(notificationTypeId);
            let userSubscriptionStatus = subNotificationTypeVal.type_name;
            let userData = await getUsers(data, userSubscriptionStatus);
            msg.status = true;
            // msg.data = userData;
            return msg;
        } catch (error) {
            msg.status = false;
            msg.message = error;
            return msg;
        }
    }

    Pushnotifications.remoteMethod(
        'execUserType',
        {
            http: { path: '/execusertype', verb: 'post' },
            description: 'API for boot script - notification.js for running cron job everytime the server restarts',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getStudents = (cond, userIds, title, message, emailMessage, deep_link, image_url, created_by) => {
        return new Promise((resolve, reject) => {
            let Quizuser = Pushnotifications.app.models.quiz_user;
            Quizuser.find({
                where: {
                    id: { inq: userIds }
                },
                fields: ['email', 'contactNumber', 'packageName', 'id'],
                include: [
                    {
                        relation: 'quiz_user_fcms',
                        scope: {
                            where: {
                                status: 1,
                                and: cond
                            }
                        }
                    }
                ]
            }, function (err, studentData) {

                if (err) {
                    console.log(err)
                    reject(err);
                }
                studentData = JSON.parse( JSON.stringify(studentData));
                // console.log("studentData",studentData);
                if (studentData !== undefined) {
                    if (studentData.length > 0) {
                        getUserFcm(studentData, title, message, emailMessage, deep_link, image_url, created_by);
                        resolve();
                        // resolve('Push notification sent successfully.');
                    } else {
                        resolve('No record found.');
                    }
                } else {
                    resolve('No record found.');
                }
            })
        });
    }

    let getSchoolStudents = (cond, userIds, school_id, class_id, section_id, title, message, emailMessage, deep_link, image_url, created_by) => {
        // console.log("cond", cond);
        return new Promise((resolve, reject) => {
            let Userdata = Pushnotifications.app.models.user_data;
            Userdata.find({
                where: {
                    user_id: { inq: userIds },
                    school_id: { inq: school_id },
                    class_id: { inq: class_id },
                    section_id: { inq: section_id }
                },
                include: [
                    {
                        relation: 'quiz_user_data',
                        scope: {
                            where: {
                                id: { inq: userIds }
                            },
                            fields: ['email', 'contactNumber', 'packageName', 'id'],
                            include: [
                                {
                                    relation: 'quiz_user_fcms',
                                    scope: {
                                        where: {
                                            status: 1,
                                            and: cond
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, studentData) {
                if (err) {
                    console.log(err)
                    reject(err);
                }
                if (studentData.length > 0) {
                    let quizUser = [];
                    studentData.forEach((studentVal) => {
                        // console.log("studentVal 885", studentVal);
                        // quizUser.push(studentVal.toJSON().quiz_user_data);
                        let tempObj = studentVal.toJSON().quiz_user_data;
                        tempObj.school_id = studentVal.school_id;
                        quizUser.push(tempObj);
                    });
                    if (quizUser.length > 0) {
                        getUserFcm(quizUser, title, message, emailMessage, deep_link, image_url, created_by);
                        resolve();
                    }
                }
                // console.log("studentData", studentData);
                // resolve('No record found.');
            })
        });
    }

    let getSchoolStaff = (cond, userIds, school_id, class_id, section_id, title, message, emailMessage, deep_link, image_url, created_by) => {
        // console.log("cond", cond);
        return new Promise((resolve, reject) => {
            let msg = {};
            var ds = Pushnotifications.dataSource;
            let params;
            var sql = `SELECT qu.id
            FROM user_classes uc
            join user u ON u.id = uc.user_id
            join quiz_user qu ON qu.email = u.email
            where 1=1 and u.status=1 and uc.school_id IN(${school_id})
            and uc.class_id IN(${class_id}) and uc.section_id IN(${section_id})
            group by qu.id`

            ds.connector.query(sql, params, function (err, quizUser) {
                if (err) {
                    console.log(err);
                    msg = { status: false, message: err };
                    reject(msg);
                }
                let quizUserId = []
                quizUser.forEach(qu => {
                    quizUserId.push(qu.id);
                })
                // quizUser = Object.values(JSON.parse(JSON.stringify(quizUser)));
                // console.log(quizUserId);
                let Quizuser = Pushnotifications.app.models.quiz_user;
                Quizuser.find({
                    where: {
                        id: { inq: quizUserId }
                    },
                    fields: ['email', 'contactNumber', 'packageName', 'id'],
                    include: [
                        {
                            relation: 'quiz_user_fcms',
                            scope: {
                                where: {
                                    status: 1,
                                    and: cond
                                }
                            }
                        }
                    ]
                }, function (err, studentData) {

                    if (err) {
                        console.log(err)
                        reject(err);
                    }
                    // console.log("studentData",studentData);
                    studentData = JSON.parse( JSON.stringify(studentData));
                    if (studentData !== undefined) {
                        if (studentData.length > 0) {
                            // console.log(studentData);
                            getUserFcm(studentData, title, message, emailMessage, deep_link, image_url, created_by);
                            resolve();
                        } else {
                            resolve('No record found.');
                        }
                    } else {
                        resolve('No record found.');
                    }
                })
            });
        });
    }


    let getUserFcm = (studentData, title, message, emailMessage, deep_link, image_url, created_by) => {
        return new Promise((resolve, reject) => {
            studentData.forEach((studentVal) => {
                // console.log("line no 902",studentVal);
                let userData = studentVal.quiz_user_fcms;
                let userFcm = JSON.stringify(userData);
                // console.log(userFcm);
                if (userFcm != undefined) {
                    userFcm = JSON.parse(userFcm);
                    if (userFcm) {
                        userFcm.forEach((fVal) => {
                            //let fcmId = userFcm[0].fcm_id;
                            let fcmId = fVal.fcm_id;
                            let sent_to = fVal.user_id
                            let class_id = fVal.class_id
                            deep_link = deep_link.replace('{Grade}', class_id);
                            if (message) {
                                fcmPush(fcmId, title, message, deep_link, image_url, sent_to, class_id, created_by);
                            }
                            deep_link = deep_link.replace('/' + class_id + '/', '/{Grade}/'); //Replace in case of multiple class ids
                            let mailMessage = emailMessage;
                            if (studentVal.email != '' && mailMessage) {
                                var currDate = new Date();
                                if (emailMessage.includes("##PREV_MONTH_USER_QUIZ_REPORT_URL##")
                                    || emailMessage.includes("##PREV_MONTH_USER_POSTTEST_REPORT_URL##")) {
                                    var thisMonth = currDate.getMonth();
                                    currDate.setMonth(thisMonth);
                                    if (currDate.getMonth() != thisMonth - 1 && (currDate.getMonth() != 11 || (thisMonth == 11 && currDate.getDate() == 1))) {
                                        currDate.setDate(0);
                                    }
                                    var from_date = currDate.getFullYear() + "-" + currDate.getMonth() + "-" + "1";
                                    var to_date = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                                    let quizQueryString = `email=${studentVal.email}&user_id=${sent_to}&from_date=${from_date}&to_date=${to_date}&report_type=quiz&type=user`;
                                    // create a buffer
                                    quizQueryString = Buffer.from(quizQueryString, 'utf-8');
                                    // decode buffer as Base64
                                    quizQueryString = quizQueryString.toString('base64');
                                    // let quizUrl = `https://support.marksharks.com/#/download-report?${quizQueryString}`;
                                    let quizUrl = SETTINGS.SETTINGS.quizUrl_download_report+`?${quizQueryString}`;
                                    mailMessage = mailMessage.replace("##PREV_MONTH_USER_QUIZ_REPORT_URL##", quizUrl);

                                    let postTestQueryString = `email=${studentVal.email}&user_id=${sent_to}&from_date=${from_date}&to_date=${to_date}&report_type=posttest&type=user`;
                                    // create a buffer
                                    postTestQueryString = Buffer.from(postTestQueryString, 'utf-8');
                                    // decode buffer as Base64
                                    postTestQueryString = postTestQueryString.toString('base64');
                                    // let postTestUrl = `https://support.marksharks.com/#/download-report?${postTestQueryString}`;
                                    let postTestUrl = SETTINGS.SETTINGS.postTestUrl_download_report+`?${postTestQueryString}`;
                                    // console.log(postTestUrl);
                                    mailMessage = mailMessage.replace("##PREV_MONTH_USER_POSTTEST_REPORT_URL##", postTestUrl);
                                } else if (emailMessage.includes("##PREV_MONTH_SCHOOL_QUIZ_REPORT_URL##")
                                    || emailMessage.includes("##PREV_MONTH_SCHOOL_POSTTEST_REPORT_URL##")) {
                                    var thisMonth = currDate.getMonth();
                                    currDate.setMonth(thisMonth);
                                    if (currDate.getMonth() != thisMonth - 1 && (currDate.getMonth() != 11 || (thisMonth == 11 && currDate.getDate() == 1))) {
                                        currDate.setDate(0);
                                    }
                                    var from_date = currDate.getFullYear() + "-" + currDate.getMonth() + "-" + "1";
                                    var to_date = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                                    // console.log("1045", studentVal.email);
                                    let quizQueryString = `email=${studentVal.email}&user_id=${sent_to}&from_date=${from_date}&to_date=${to_date}&report_type=quiz&type=school&school_id=${studentVal.school_id}`;
                                    // create a buffer
                                    quizQueryString = Buffer.from(quizQueryString, 'utf-8');
                                    // decode buffer as Base64
                                    quizQueryString = quizQueryString.toString('base64');
                                    // let quizUrl = `https://support.marksharks.com/#/download-report?${quizQueryString}`;
                                    let quizUrl = SETTINGS.SETTINGS.quizUrl_download_report+`?${quizQueryString}`;
                                    mailMessage = mailMessage.replace("##PREV_MONTH_SCHOOL_QUIZ_REPORT_URL##", quizUrl);

                                    let postTestQueryString = `email=${studentVal.email}&user_id=${sent_to}&from_date=${from_date}&to_date=${to_date}&report_type=posttest&type=school&school_id=${studentVal.school_id}`;
                                    // create a buffer
                                    postTestQueryString = Buffer.from(postTestQueryString, 'utf-8');
                                    // decode buffer as Base64
                                    postTestQueryString = postTestQueryString.toString('base64');
                                    // let postTestUrl = `https://support.marksharks.com/#/download-report?${postTestQueryString}`;
                                    let postTestUrl = SETTINGS.SETTINGS.postTestUrl_download_report+`?${postTestQueryString}`;
                                    // console.log(postTestUrl);
                                    mailMessage = mailMessage.replace("##PREV_MONTH_SCHOOL_POSTTEST_REPORT_URL##", postTestUrl);
                                }
                                mailPush('teacher@marksharks.com', studentVal.email, title, mailMessage);
                            }
                        });
                    }
                }
            });
            resolve('Push notification sent successfully.');
        });
    }

    let fcmPush = (fcmId, title, message, deep_link, image_url, sent_to, class_id, created_by) => {
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
            let Pushnotificationlogs = Pushnotifications.app.models.push_notification_logs;
            let logObj = {
                module: "Schedule Notification",
                class_id: class_id,
                sent_to: sent_to,
                notification_message: notifyMessage,
                title: title,
                message: logMsg,
                response: result,
                sent_by: created_by
            }
            Pushnotificationlogs.upsert(logObj, function (error, res) {
                if (error) {
                    console.log(error);
                }
            });
        });
    }

    let appDeepLink = (link_id) => {
        return new Promise((resolve, reject) => {
            let appDeepLinks = Pushnotifications.app.models.app_deep_links;
            appDeepLinks.findOne({ where: { id: link_id } }, function (err, appData) {
                if (err) {
                    reject(err.message);
                }
                resolve(appData);
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

    let mailPush = (from, to, subject, description) => {
        let msg = {};
        from = (from == undefined || from == null || from == '') ? undefined : from;
        to = (to == undefined || to == null || to == '') ? undefined : to;
        subject = (subject == undefined || subject == null || subject == '') ? undefined : subject;
        description = (description == undefined || description == null || description == '') ? undefined : entities.decode(entities.decode(description));

        if (from !== undefined && to !== undefined && subject !== undefined && description !== undefined) {
            let data = "api" + ":" + "key-2e1019a3bb874acc2075933c6e57a755";
            let buff = Buffer(data);
            let encVal = buff.toString('base64');
            // let url = `https://api.mailgun.net/v3/portal.marksharks.com/messages`;
            let url = SETTINGS.SETTINGS.mailgun_url;
            // let encVal = btoa(username+":"+password);
            let mailData = {
                from: from,
                to: to,
                subject: subject,
                html: description
            };
            let contentLength = mailData.length;
            // console.log(subsriptionData);


            request.post({
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": contentLength,
                    "Authorization": "Basic " + encVal
                },
                "url": url,
                "form": mailData
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    // cb(null, msg);
                }
                // console.log(res);
                /* if (JSON.parse(res.body).exception) {
                    msg.status = false;
                    msg.message = JSON.parse(res.body).exception;
                    cb(null, msg);
                } else {
                    msg.status = true;				
                } */
            });
        }

    }
};
