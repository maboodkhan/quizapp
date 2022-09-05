'use strict';

module.exports = function (Questionpermissions) {

    Questionpermissions.addPermission = async function (data, cb) {
        let user_id = (data.user_id == '', data.user_id == null, data.user_id == undefined) ? undefined : data.user_id;
        let topic_id = (data.topic_id == '', data.topic_id == null, data.topic_id == undefined) ? undefined : data.topic_id;
        let msg = {};

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id." };
            return cb(null, msg);
        }
        try {
            await topic_id.forEach(topic => {
                let obj = {
                    user_id: user_id,
                    topic_id: topic
                }
                // console.log("new object",obj);
                Questionpermissions.upsertWithWhere(obj, obj, function (err, result) {
                    if (err) {
                        msg = { status: false, message: err };
                        return msg;
                    }
                });
            });
            msg = { status: true, message: "permission assign" };
            return msg;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    Questionpermissions.remoteMethod(
        'addPermission',
        {
            http: { path: '/addPermission', verb: 'post' },
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    )

    Questionpermissions.findPermission = function (data, cb) {
        let user_id = (data.user_id == '', data.user_id == null, data.user_id == undefined) ? undefined : data.user_id;
        let topic_id = (data.topic_id == '', data.topic_id == null, data.topic_id == undefined) ? undefined : data.topic_id;
        let msg = {};

        if (topic_id == undefined) {
            msg = { status: false, message: "Please provide topic id." };
            return cb(null, msg);
        }

            Questionpermissions.find({
                where: {
                    and:
                        [
                            { user_id: user_id },
                            { topic_id: { inq: topic_id } }
                        ]
                },
            }, function (err, result) {
                if (err) {
                    msg = { status: false, message: err };
                    return cb(null, msg);
                }
                if(result.length == topic_id.length){
                    msg = { status: true, message: "Permission allowed" };
                    return cb(null, msg);
                }else{
                    msg = { status: false, message: "Permission denied" };
                    return cb(null, msg);
                }
            });

    }

    Questionpermissions.remoteMethod(
        'findPermission',
        {
            http: { path: '/findPermission', verb: 'post' },
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    )

};
