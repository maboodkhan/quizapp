'use strict';
// const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SETTINGS = require('../../server/system-config');
const zoomApiKey = SETTINGS.API_KEYS.zoomApiKey;
const zoomSecretKey = SETTINGS.API_KEYS.zoomSecretKey;

module.exports = function(Zoomclassmeeting) {
    Zoomclassmeeting.getZoomMeeting = function(data,cb){
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let meeting_id = (data.meeting_id == undefined || data.meeting_id == null || data.meeting_id == '') ? undefined : data.meeting_id;
        let meeting_status = (data.meeting_status == undefined || data.meeting_status == null || data.meeting_status == '') ? "true" : data.meeting_status;

        /*if (user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return cb(null, msg);
        }*/
        
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

        /*if (section_id == undefined ) {
			msg.status = false;
			msg.message = "Please provide the section id";
			return cb(null, msg);
        }
        
        if (subject_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the subject id";
			return cb(null, msg);
        }

        if (meeting_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting id";
			return cb(null, msg);
        }*/

        let cond = {
            user_id: user_id,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            meeting_id: meeting_id,
            meeting_status: meeting_status
        }

        Zoomclassmeeting.find({where:cond},function(err,result){
            if(err){
                msg.status = false;
                msg.message = err.message;
                return cb(null,msg);
            }
            return cb(null,result);
        });
    }

    Zoomclassmeeting.remoteMethod(
        'getZoomMeeting',
        {
            http: {path: '/getZoomMeeting', verb: 'post'},
            description: 'Get zoom meeting',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
            
        }
    );


    Zoomclassmeeting.createMeeting = function(data,cb){
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let meeting_id = (data.meeting_id == undefined || data.meeting_id == null || data.meeting_id == '') ? undefined : data.meeting_id;
        let meeting_password = (data.meeting_password == undefined || data.meeting_password == null || data.meeting_password == '') ? undefined : data.meeting_password;
        let meeting_status = (data.meeting_status == undefined || data.meeting_status == null || data.meeting_status == '') ? undefined : data.meeting_status;
        let message = (data.message == undefined || data.message == null || data.message == '') ? undefined : data.message;
        let zoomUrl = (data.zoomUrl == undefined || data.zoomUrl == null || data.zoomUrl == '') ? undefined : data.zoomUrl;
        let localPhoneNo = (data.localPhoneNo == undefined || data.localPhoneNo == null || data.localPhoneNo == '') ? undefined : data.localPhoneNo;
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '') ? 0 : data.schedule_id;
        
        if (user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return cb(null, msg);
        }
        
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
        
        if (subject_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the subject id";
			return cb(null, msg);
        }
        
        if (meeting_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting id";
			return cb(null, msg);
        }
        
        if (meeting_password == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting password";
			return cb(null, msg);
        }
        
        if (meeting_status == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting status";
			return cb(null, msg);
		}

		if (message == undefined) {
			msg.status = false;
			msg.message = "Please provide the message";
			return cb(null, msg);
        }
        
        let cond = {
            user_id: user_id,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            meeting_id: meeting_id
        }        

        Zoomclassmeeting.findOne({
            where: {schedule_id: schedule_id}
        }, function(err, classResult){
            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            
            let scheduleCond = {id: schedule_id};
            let timeChkCond = {};
            if(classResult && schedule_id>0){ // Check If class has already started then to skip 10 minutes check
                //scheduleCond = {schedule_id: schedule_id};
            } else {
                let start_date = new Date();
                start_date.setMinutes(start_date.getMinutes()-10);
                start_date = start_date.toISOString();
                let end_date = new Date();
                end_date.setMinutes(end_date.getMinutes()+10);
                end_date = end_date.toISOString();

                let start_1 = {
                    and: [
                        { start_date: { between: [start_date, end_date] } }
                    ]
                };
                timeChkCond = { or: [start_1] };
            }
            let Onlineschedule = Zoomclassmeeting.app.models.online_schedule;
            Onlineschedule.findOne({
                where: {
                    and: [
                        { school_id: school_id },
                        { class_id: class_id },
                        { section_id: section_id },
                        scheduleCond,
                        timeChkCond
                    ]
                }
            }, function (err, response) {
                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    return cb(null, msg);
                }

                if (response) {
                    
                    if(meeting_status == "true"){ //Close all previous meetings of same class/section/subject
                        Zoomclassmeeting.update({
                            school_id: school_id,
                            class_id: class_id,
                            section_id: section_id,
                            subject_id: subject_id
                        },
                        {meeting_status:"false"},
                        function(err, updData){
                            if (err) {
                                msg.status = false;
                                msg.message = err.message;
                                return cb(null, msg);
                            }
                            let meetingVal = {
                                user_id: user_id,
                                school_id: school_id,
                                class_id: class_id,
                                section_id: section_id,
                                subject_id: subject_id,
                                meeting_id: meeting_id,
                                meeting_password: meeting_password,
                                meeting_status: meeting_status,
                                message: message,
                                zoomUrl: zoomUrl,
                                localPhoneNo: localPhoneNo,
                                schedule_id: response.id
                            }
                            Zoomclassmeeting.upsertWithWhere(cond, meetingVal, function (err, result) {
                                if (err) {
                                    msg.status = false;
                                    msg.message = err.message;
                                    return cb(null, msg);
                                }
                                msg.status = true;
                                if(meeting_status == "true") {
                                    msg.message = "Zoom meeting added successfully.";
                                    let classStatusVal = classStatusUpdate(response.id, 1);
                                } else {
                                    msg.message = "Zoom meeting ended successfully.";
                                    let classStatusVal = classStatusUpdate(response.id, 2);
                                }
                                return cb(null, msg);
                            });
                        });
                    } else {
                        let meetingVal = {
                            user_id: user_id,
                            school_id: school_id,
                            class_id: class_id,
                            section_id: section_id,
                            subject_id: subject_id,
                            meeting_id: meeting_id,
                            meeting_password: meeting_password,
                            meeting_status: meeting_status,
                            message: message,
                            zoomUrl: zoomUrl,
                            localPhoneNo: localPhoneNo,
                            schedule_id: response.id
                        }
                        Zoomclassmeeting.upsertWithWhere(cond, meetingVal, function (err, result) {
                            if (err) {
                                msg.status = false;
                                msg.message = err.message;
                                return cb(null, msg);
                            }
                            msg.status = true;
                            if(meeting_status == "true") {
                                msg.message = "Zoom meeting added successfully.";
                                let classStatusVal = classStatusUpdate(response.id, 1);   
                            } else {
                                msg.message = "Zoom meeting ended successfully.";
                                let classStatusVal = classStatusUpdate(response.id, 2);
                            }
                            return cb(null, msg);
                        });
                    }
                    
                    
                } else {
                    msg.status = false;
                    msg.message = "No online class scheduled. Please try again.";
                    return cb(null, msg);
                }
            });
        });
    }

    Zoomclassmeeting.remoteMethod(
        'createMeeting',
        {
            http: {path: '/createMeeting', verb: 'post'},
            description: 'create new zoom meeting',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}

        }
    );

    let classStatusUpdate = (schedule_id, class_status) => {
        let Onlineschedule = Zoomclassmeeting.app.models.online_schedule;
        Onlineschedule.update(
            {id: schedule_id},
            {class_status: class_status},
            function(err, classUpdateStatus){

            }
        )
    }

    Zoomclassmeeting.generateSignature = function(meeting_id, role, cb){
        let msg = {};
        
        if (meeting_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting id";
			return cb(null, msg);
        }

        if (role == undefined) {
			msg.status = false;
			msg.message = "Please provide role";
			return cb(null, msg);
        }
        
        let generateSignatureKeyVal = generateSignatureKey(zoomApiKey, zoomSecretKey, meeting_id, role);
        msg.status = true;
        msg.data = {signature: generateSignatureKeyVal, apiKey: zoomApiKey};
        return cb(null, msg);
    }

    Zoomclassmeeting.remoteMethod(
        'generateSignature',
        {
            http: {path: '/generateSignature', verb: 'post'},
            description: 'Generate zoom meeting signate',
            accepts: [{arg: 'meeting_id', type: 'string'},
            {arg: 'role', type: 'string'}],
            returns: {root: true, type: 'json'}

        }
    );

    Zoomclassmeeting.getTeacherZoomMeeting = function(data,cb){
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
		let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let meeting_id = (data.meeting_id == undefined || data.meeting_id == null || data.meeting_id == '') ? undefined : data.meeting_id;
        let meeting_status = (data.meeting_status == undefined || data.meeting_status == null || data.meeting_status == '') ? "true" : data.meeting_status;

        if (user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return cb(null, msg);
        }
        
        // if (school_id == undefined) {
		// 	msg.status = false;
		// 	msg.message = "Please provide the school id";
		// 	return cb(null, msg);
        // }
        
        // if (class_id == undefined) {
		// 	msg.status = false;
		// 	msg.message = "Please provide the class id";
		// 	return cb(null, msg);
        // }

        /*if (section_id == undefined ) {
			msg.status = false;
			msg.message = "Please provide the section id";
			return cb(null, msg);
        }
        
        if (subject_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the subject id";
			return cb(null, msg);
        }

        if (meeting_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the meeting id";
			return cb(null, msg);
        }*/

        let cond = {
            user_id: user_id,
            school_id: school_id,
            class_id: class_id,
            section_id: section_id,
            subject_id: subject_id,
            meeting_id: meeting_id,
            meeting_status: meeting_status
        }

        Zoomclassmeeting.find({where:cond},function(err,result){
            if(err){
                msg.status = false;
                msg.message = err.message;
                return cb(null,msg);
            }
            return cb(null,result);
        });
    }

    Zoomclassmeeting.remoteMethod(
        'getTeacherZoomMeeting',
        {
            http: {path: '/getTeacherZoomMeeting', verb: 'post'},
            description: 'Get teacher zoom meeting',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
            
        }
    );


    let generateSignatureKey = (apiKey, apiSecret, meetingNumber, role) => {
        // Prevent time sync issue between client signature generation and zoom 
        role = 0;
        const timestamp = new Date().getTime() - 30000
        const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64')
        const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64')
        const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64')

        return signature;
    } 

    let generateToken = () => {
        const payload = {
            iss: zoomApiKey,
            exp: ((new Date()).getTime() + 5000)
        };
        const token = jwt.sign(payload, zoomSecretKey);
        // console.log(token)
    }

    Zoomclassmeeting.checkZoomMeeting = function(data,cb){
        let msg = {};
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '') ? undefined : data.schedule_id;
        
        Zoomclassmeeting.findOne({where:{schedule_id: schedule_id}},function(err,result){
            if(err){
                msg.status = false;
                msg.message = err.message;
                return cb(null,msg);
            }
            if(result){
                msg.status = true;
                msg.message = "Scheduled Found";
                return cb(null,msg);
            }else{
                msg.status = false;
                msg.message = "Scheduled Not Found";
                return cb(null,msg);
            }
        });
    }

    Zoomclassmeeting.remoteMethod(
        'checkZoomMeeting',
        {
            http: {path: '/checkZoomMeeting', verb: 'post'},
            description: 'Find zoom meeting',
            accepts: [{arg: 'data', type: 'object', http: {source: 'body'}}],
            returns: {root: true, type: 'json'}
            
        }
    );

};
