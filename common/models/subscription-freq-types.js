'use strict';
module.exports = function (SubscriptionFreqTypes) {

    SubscriptionFreqTypes.getAllFrequencyType = function (data, res, cb) {
        let msg = {};
        SubscriptionFreqTypes.find({}, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    SubscriptionFreqTypes.remoteMethod(
        'getAllFrequencyType',
        {
            http: { path: '/getAllFrequencyType', verb: 'post' },
            description: 'Get all master school subscriptions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

}