'use strict';
var FCM = require('fcm-push');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

module.exports = function (Homeworksubmissions) {

    Homeworksubmissions.homeWorkSubmit = async function (data, cb) {
        let msg = {};
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let given_to = (data.given_to == undefined || data.given_to == null || data.given_to == '' ? undefined : data.given_to);
        let remarks = (data.remarks == undefined || data.remarks == null || data.remarks == '' ? undefined : entities.encode(data.remarks));
        let user_type = (data.user_type == undefined || data.user_type == null || data.user_type == '' ? 0 : data.user_type);
        let filepath = (data.filepath == undefined || data.filepath == null || data.filepath == '' ? undefined : data.filepath);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
		let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let webNotify = true;
        let title = `Homework submission`;
        let message = 'Homework has been submitted by student';
        deep_link = "ms://marksharks/cbse/{Grade}/HomeWorkTeacherActivity";

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created_by." };
            return cb(null, msg);
        }

        if (given_to == undefined) {
            msg = { status: false, message: "Please provide given to." };
            return cb(null, msg);
        }

        if (filepath != undefined && user_type == undefined) {
            msg = { status: false, message: "Please provide user type." };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status." };
            return cb(null, msg);
        }


        let submissionData = await homeworkSubmission(homework_id, status, created_by);
        let remarkData = await HWRemarks(homework_id, submissionData, remarks, user_type, status, given_to, created_by);
        if (filepath != undefined) {
            let hwFiles = await HWFiles(homework_id, submissionData, remarkData, filepath, user_type, status, created_by);
        }
        if(status == 1){
            await getStudents(title, message, webNotify, given_to, created_by, deep_link, image_url, class_id);
        }
        msg = { status: true, data: submissionData }
        return msg;
    }

    Homeworksubmissions.remoteMethod(
        'homeWorkSubmit',
        {
            http: { path: '/homeWorkSubmit', verb: 'post' },
            description: 'Edit Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let homeworkSubmission = (homework_id, status, created_by) => {
        return new Promise((resolve, reject) => {
            let obj = {
                homework_id: homework_id,
                submitted_by: created_by,
                status: status,
            }
            if(status == 1){
                obj.submitted_on = new Date();
            }
            Homeworksubmissions.upsert(obj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            });
        });
    }

    let HWRemarks = (homework_id, submissionData, remarks, user_type, status, given_to, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkremarks = Homeworksubmissions.app.models.homework_remarks;
            let obj = {
                homework_id: homework_id,
                submission_id: submissionData.id,
                remarks: remarks,
                user_type: user_type,
                status: status,
                created_by: created_by,
                given_to: given_to,
                created_on: new Date()
            }
            Homeworkremarks.upsert(obj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            });
        });
    }

    let HWFiles = (homework_id, submissionData, remarkData, filepath, user_type, status, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkfiles = Homeworksubmissions.app.models.homework_files;
            let saveObj = {
                homework_id: homework_id,
                submission_id: submissionData.id,
                remark_id: remarkData.id,
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


    Homeworksubmissions.edithomeWorkSubmit = async function (data, cb) {
        let msg = {};
        let submission_id = (data.submission_id == undefined || data.submission_id == null || data.submission_id == '' ? undefined : data.submission_id);
        let homework_id = (data.homework_id == undefined || data.homework_id == null || data.homework_id == '' ? undefined : data.homework_id);
        let created_by = (data.created_by == undefined || data.created_by == null || data.created_by == '' ? undefined : data.created_by);
        let given_to = (data.given_to == undefined || data.given_to == null || data.given_to == '' ? undefined : data.given_to);
        let remarks = (data.remarks == undefined || data.remarks == null || data.remarks == '' ? undefined : entities.encode(data.remarks));
        let user_type = (data.user_type == undefined || data.user_type == null || data.user_type == '' ? 0 : data.user_type);
        let filepath = (data.filepath == undefined || data.filepath == null || data.filepath == '' ? undefined : data.filepath);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let deep_link = (data.deep_link == undefined || data.deep_link == null || data.deep_link == '' ? '' : data.deep_link);
        let image_url = (data.image_url == undefined || data.image_url == null || data.image_url == '' ? '' : data.image_url);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let webNotify = true;
        let title = `Homework submission`;
        let message = 'Homework has been submitted by student';
        deep_link = "ms://marksharks/cbse/{Grade}/HomeWorkTeacherActivity";

        if (homework_id == undefined) {
            msg = { status: false, message: "Please provide homework id." };
            return cb(null, msg);
        }

        if (created_by == undefined) {
            msg = { status: false, message: "Please provide created_by." };
            return cb(null, msg);
        }

        if (filepath != undefined && user_type == undefined) {
            msg = { status: false, message: "Please provide user type." };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status." };
            return cb(null, msg);
        }


        let submissionData = await edithomeworkSubmission(homework_id, submission_id, status, created_by);
        let remarkData = await editHWRemarks(homework_id, submission_id, remarks, user_type, status, given_to, created_by);
        if (filepath != undefined) {
            let hwFiles = await editHWFiles(homework_id, submission_id, remarkData, filepath, user_type, status, created_by);
        }
        if(status == 1){
            await getStudents(title, message, webNotify, given_to, created_by, deep_link, image_url, class_id);
        }
        msg = { status: true, data: submissionData }
        return msg;
    }

    Homeworksubmissions.remoteMethod(
        'edithomeWorkSubmit',
        {
            http: { path: '/edithomeWorkSubmit', verb: 'post' },
            description: 'Edit Home Work',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let edithomeworkSubmission = (homework_id, submission_id, status, created_by) => {
        return new Promise((resolve, reject) => {
            let obj = {
                homework_id: homework_id,
                submitted_by: created_by,
                status: status,
                submitted_on: new Date()
            }
            Homeworksubmissions.upsertWithWhere({ id: submission_id }, obj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            });
        });
    }

    let editHWRemarks = (homework_id, submission_id, remarks, user_type, status, given_to, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkremarks = Homeworksubmissions.app.models.homework_remarks;
            let obj = {
                homework_id: homework_id,
                submission_id: submission_id,
                remarks: remarks,
                user_type: user_type,
                status: status,
                created_by: created_by,
                given_to: given_to,
                created_on: new Date()
            }
            Homeworkremarks.upsertWithWhere({
                homework_id: homework_id,
                submission_id: submission_id,
                user_type: 0
            }, obj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            });
        });
    }

    let editHWFiles = (homework_id, submission_id, remarkData, filepath, user_type, status, created_by) => {
        return new Promise((resolve, reject) => {
            let Homeworkfiles = Homeworksubmissions.app.models.homework_files;
            let saveObj = {
                homework_id: homework_id,
                submission_id: submission_id,
                remark_id: remarkData.id,
                filepath: filepath,
                user_type: user_type,
                created_by: created_by,
                status: status,
                created_on: new Date()
            }
            Homeworkfiles.upsertWithWhere( {
                homework_id: homework_id,
                submission_id: submission_id,
                user_type: 0
            },saveObj, function (err, res) {
                if (err) { reject(err) }
                resolve(res);
            })
        });
    }

    let getStudents = (title, message, webNotify, given_to, sent_by, deep_link, image_url, class_id) => {
		return new Promise((resolve, reject) => {
            // console.log(userCond);
            let Quizuser = Homeworksubmissions.app.models.quiz_user;
			Quizuser.find({
				where: {
					id: given_to
				},
				fields: ['email', 'contactNumber', 'packageName', 'id'],
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
			}, function (err, studentData) {

				if (err) {
					console.log(err)
					reject(err);
				}
				// console.log(studentData);
				if (studentData !== undefined) {
					if (studentData.length > 0) {
						studentData.forEach((studentVal) => {
							// console.log(studentVal);
							let userData = studentVal.toJSON().quiz_user_fcms;
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
										
										// console.log(fcmId);
                                        // console.log(deep_link);
                                        deep_link = deep_link.replace('{Grade}', class_id);
										fcmPush(fcmId, title, message, webNotify, sent_to, class_id, sent_by, deep_link, image_url);
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


    let fcmPush = (fcmId, title, message, webNotify, sent_to, class_id, sent_by, deep_link, image_url) => {
        var serverKey = 'AAAAj9KKx6c:APA91bEW46zFqX4Fj2djDFrkuNF7JPY65p_8JLYokX5Vw0E8qtMwM8JL5NFjyGIx-B2tflxVr4NIYI1V028uzSSw6vLBhS5pGsEkZyZ9nK_k7GVLDaQEvec_I4t3SWBxkcawV-UFdX0j';
        var fcm = new FCM(serverKey);
        let logMsg = message;
        let module = "Homework";
        
        let nwMessage = {
			title: title,
			message: message,
			deep_link: deep_link,
			image_url: image_url
		};
		if(image_url == '') {
			nwMessage = {
				title: title,
				message: message,
				deep_link: deep_link
			};
		}
		
		if(webNotify){
			nwMessage = {
				mp_message: message,
				mp_icnm: "ic_notification_bar",
				mp_title: title,
				deep_link: deep_link,
				image_url: image_url
			};
			if(image_url == ''){
				nwMessage = {
					mp_message: message,
					mp_icnm: "ic_notification_bar",
					mp_title: title,
					deep_link: deep_link
				};
			}
		}

        
        // let nwMessage = {
        //     title: title,
        //     message: message
        // };
        
        // if (webNotify) {
        //     module = "Homework";
        //     nwMessage = {
        //         mp_message: message,
        //         mp_icnm: "ic_notification_bar",
        //         mp_title: title
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
				if(JSON.parse(result).success == 1){					
					notifyMessage = "Sent";
				}
			}
            let Pushnotificationlogs = Homeworksubmissions.app.models.push_notification_logs;
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

};
