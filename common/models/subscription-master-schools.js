'use strict';
module.exports = function (SubscriptionMasterSchools) {

    SubscriptionMasterSchools.createSubscriptionMS = function (data, cb) {
        let msg = {};
        let schoolSubId = (data.schoolSubId == undefined || data.schoolSubId == null || data.schoolSubId == '' ? 0 : data.schoolSubId);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let freq_type_id = (data.freq_type_id == undefined || data.freq_type_id == null || data.freq_type_id == '' ? undefined : data.freq_type_id);
        let amount = (data.amount == undefined || data.amount == null || data.amount == '' ? undefined : data.amount);
        let discount_amt = (data.discount_amt == undefined || data.discount_amt == null || data.discount_amt == '' ? undefined : data.discount_amt);
        let total_amount = (data.total_amount == undefined || data.total_amount == null || data.total_amount == '' ? undefined : data.total_amount);
        let status = (data.status == undefined || data.status == null) ? undefined : data.status;

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (class_id == undefined) {
            msg = { status: false, message: "Please provide class id" };
            return cb(null, msg);
        }

        if (freq_type_id == undefined) {
            msg = { status: false, message: "Please provide freq_type_id" };
            return cb(null, msg);
        }
        if (amount == undefined) {
            msg = { status: false, message: "Please provide amount" };
            return cb(null, msg);
        }

        if (total_amount == undefined) {
            msg = { status: false, message: "Please provide total_amount" };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        let newSubscriptionMS = {
            school_id: school_id,
            class_id: class_id,
            freq_type_id: freq_type_id,
            amount: amount,
            discount_amt: discount_amt,
            total_amount: total_amount,
            status: status
        }
        SubscriptionMasterSchools.findOne({
            where: {
                id: { neq: schoolSubId },
                school_id: school_id,
                class_id: class_id,
                freq_type_id: freq_type_id,
            }
        }, function (err, res) {
            if (res) {
                msg = { status: false, message: 'Subscription is already created' };
                return cb(null, msg);
            } else {
                SubscriptionMasterSchools.upsertWithWhere({ id: schoolSubId }, newSubscriptionMS, function (err, result) {
                    if (err) {
                        return cb(null, err);
                    }
                    msg = { status: true, data: result };
                    return cb(null, msg);
                });
            }
        })

    }

    SubscriptionMasterSchools.remoteMethod(
        'createSubscriptionMS',
        {
            http: { path: '/createSubscriptionMS', verb: 'post' },
            description: 'Get SubscriptionMasterSchools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    SubscriptionMasterSchools.getSubscriptionMSList = function (data, res, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = { status: { inq: [1, 2] } }

        if (school_id != undefined) {
            cond.school_id = { inq: school_id }
        }

        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }

        SubscriptionMasterSchools.find({
            where: cond
        }, function (err, res) {
            SubscriptionMasterSchools.find({
                where: cond,
                include: [
                    {
                        relation: 'school',
                        scope: {
                            fields: ['school_name'],
                        }
                    },
                    {
                        relation: 'class',
                        scope: {
                            fields: ['class_name'],
                        }
                    },
                    {
                        relation: 'subscription_freq_types',
                        scope: {
                            fields: ['frequency', 'frequency_value'],
                        }
                    },
                ],
                skip: offset,
                limit: limit
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                msg = { status: true, data: result, totalSubscription: res.length };
                return cb(null, msg);
            });
        });
    }

    SubscriptionMasterSchools.remoteMethod(
        'getSubscriptionMSList',
        {
            http: { path: '/getSubscriptionMSList', verb: 'post' },
            description: 'Get all master school subscriptions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    SubscriptionMasterSchools.getSchoolSubById = function (data, res, cb) {
        let msg = {};
        let schoolSubId = (data.schoolSubId == undefined || data.schoolSubId == null || data.schoolSubId == '' ? undefined : data.schoolSubId);

        if (schoolSubId == undefined) {
            msg = { status: false, message: "Please provide subscription master school id" };
            return cb(null, msg);
        }

        SubscriptionMasterSchools.findOne({
            where: { id: schoolSubId }
        }, function (err, result) {
            if (err) {
                console.log(err);
                msg = { status: false, msg: err };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    SubscriptionMasterSchools.remoteMethod(
        'getSchoolSubById',
        {
            http: { path: '/getSchoolSubById', verb: 'post' },
            description: 'Get master school subscriptions by id',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


    SubscriptionMasterSchools.getSchoolSubForUser = function (data, res, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        SubscriptionMasterSchools.findOne({
            where: {
                user_id: user_id,
                school_id: school_id,
                class_id: class_id,
                status: { inq: [1, 2] }
            },
            include: [
                    {
                        relation: 'school',
                        scope: {
                            fields: ['school_name'],
                        }
                    },
                    {
                        relation: 'class',
                        scope: {
                            fields: ['class_name'],
                        }
                    },
                    {
                        relation: 'subscription_freq_types',
                        scope: {
                            fields: ['frequency','frequency_value'],
                        }
                    },
                ]
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            }
        );
    }

    SubscriptionMasterSchools.remoteMethod(
        'getSchoolSubForUser',
        {
            http: { path: '/getSchoolSubForUser', verb: 'post' },
            description: 'Get all master school subscriptions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );

    SubscriptionMasterSchools.getSchoolSubOfOKS = function (data, res, cb) {
        let msg = {};
        SubscriptionMasterSchools.find({ where: { school_id: 7 } }, function (err, res) {
            SubscriptionMasterSchools.find({
                where: {
                    school_id: 7
                },
                include: [
                    {
                        relation: 'school',
                        scope: {
                            fields: ['school_name'],
                        }
                    },
                    {
                        relation: 'class',
                        scope: {
                            fields: ['class_name'],
                        }
                    },
                    {
                        relation: 'subscription_freq_types',
                        scope: {
                            fields: ['frequency','frequency_value'],
                        }
                    },
                ]
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    msg = { status: false, msg: err };
                    return cb(null, msg);
                }
                msg = { status: true, data: result, totalSubscription: res.length };
                return cb(null, msg);
            });
        })

    }

    SubscriptionMasterSchools.remoteMethod(
        'getSchoolSubOfOKS',
        {
            http: { path: '/getSchoolSubOfOKS', verb: 'post' },
            description: 'Get OKS school subscriptions',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'res', type: 'object', http: { source: 'res' } }],
            returns: { root: true, type: 'json' }
        }
    );


}