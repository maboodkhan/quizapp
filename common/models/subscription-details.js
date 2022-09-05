'use strict';
module.exports = function (Subscriptiondetails) {    

    
    Subscriptiondetails.getUserSubscriptionData = function (data, cb) {
        let msg = {};
        let subscription_id = (data.subscription_id == undefined || data.subscription_id == null || data.subscription_id == '' ? undefined : data.subscription_id);

        if (subscription_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }
            Subscriptiondetails.findOne({ 
                where: { id: subscription_id },
                include: [
                    {
                        relation: 'subscription',
                        scope: {
                            fields: ['start_date', 'start_date']
                        }
                    },
                ]
               }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                console.log(result);
                msg = { status: true, data: result };
                return cb(null, msg);
            });
        

    }

    Subscriptiondetails.remoteMethod(
        'getUserSubscriptionData',
        {
            http: { path: '/getUserSubscriptionData', verb: 'post' },
            description: 'Get Subscription Data',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Subscriptiondetails.getUserSubscriptionData = function (data, cb) {
        let msg = {};
        let subscription_id = (data.subscription_id == undefined || data.subscription_id == null || data.subscription_id == '' ? undefined : data.subscription_id);

        if (subscription_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }
       
        Subscriptiondetails.findOne({ 
            where: { id: subscription_id },
            include: [
                {
                    relation: 'subscription',
                    scope: {}
                },
                {
                    relation: 'school',
                    scope:{
                        fields: ['school_name']
                    }
                },
                {
                    relation: 'class',
                    scope:{
                        fields: ['class_name']
                    }
                }
            ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result};
                return cb(null, msg);
        });
        

    }

    Subscriptiondetails.remoteMethod(
        'getUserSubscriptionData',
        {
            http: { path: '/getUserSubscriptionData', verb: 'post' },
            description: 'Get Subscription',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

}