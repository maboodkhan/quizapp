'use strict';

module.exports = function(Appdeeplinks) {

    Appdeeplinks.getAppDeepLink = function (data, cb) {
        let msg = {};

        Appdeeplinks.find({ where:{status: 1}}, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Appdeeplinks.remoteMethod(
        'getAppDeepLink',
        {
            http: { path: '/getAppDeepLink', verb: 'post' },
            description: 'Get App Deep Link',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
