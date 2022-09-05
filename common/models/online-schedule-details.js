'use strict';
var FCM = require('fcm-push');

module.exports = function (Onlinescheduledetails) {

    Onlinescheduledetails.getScheduleLesson = function (data, cb) {
        let msg = {};
        let schedule_id = (data.schedule_id == undefined || data.schedule_id == null || data.schedule_id == '' ? undefined : data.schedule_id);

        if (schedule_id == undefined) {
            msg = { status: false, message: "Please provide schedule id" };
            return cb(null, msg);
        }

        Onlinescheduledetails.find({ 
            where: { schedule_id: schedule_id },
            order: 'lesson_id ASC',
            include: [{
                relation: "lesson",
                scope: {}
            }]
         }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Onlinescheduledetails.remoteMethod(
        'getScheduleLesson',
        {
            http: { path: '/getScheduleLesson', verb: 'post' },
            description: 'get Schedule getScheduleLesson',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
};
