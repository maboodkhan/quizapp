'use strict';

module.exports = function (Pushnotificationmaster) {

    Pushnotificationmaster.notificationType = function (data, cb) {
        let id = (data.id == undefined || data.id == null || data.id == '' ? undefined : data.id);
        let msg = {};
        
        Pushnotificationmaster.find({where: {id: id, parent_id:0, status:1}}, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }


    Pushnotificationmaster.remoteMethod(
        'notificationType',
        {
            http: { path: '/notificationType', verb: 'post' },
            description: 'Get Notification Type',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Pushnotificationmaster.subNotification = function (data, cb) {
        let msg = {};
        let notificationTypeId = (data.notificationTypeId == undefined || data.notificationTypeId == null || data.notificationTypeId == '' ? undefined : data.notificationTypeId);
        Pushnotificationmaster.find({where: {parent_id:notificationTypeId, status:1}}, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }


    Pushnotificationmaster.remoteMethod(
        'subNotification',
        {
            http: { path: '/subNotification', verb: 'post' },
            description: 'Get Sub Notification',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};



