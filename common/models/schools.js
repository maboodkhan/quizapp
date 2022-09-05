'use strict';

module.exports = function (Schools) {
    Schools.getQuizSetSchools = function (data, cb) {
        let msg = {};
        //let set_name = (data.setName==undefined || data.setName==null || data.setName==''?undefined:new RegExp(data.setName,"i"));
        let set_id = (data.set_id == undefined || data.set_id == null || data.set_id == '' ? undefined : data.set_id);
        let class_id = (data.class == undefined || data.class == null || data.class == '' ? undefined : data.class);
        let section = (data.section == undefined || data.section == null || data.section == '' ? undefined : data.section);

        Schools.find({
            where: {
                and:
                    [
                        { status: 1 }
                    ]
            },
            include: [
                {
                    relation: "user_data",
                    scope: {
                        // where:{
                        //     and:[                                
                        //         {class:class_id},
                        //         {section:section}
                        //     ]
                        // }
                    }
                },
                {
                    relation: "quiz_set_schools",
                    scope: {
                        fields: ["school_id", "publishDate", "quiz_set_id"],
                        where: {
                            and: [
                                { quiz_set_id: set_id },
                                { status: 1 }
                            ]
                        }
                    }
                }
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
                msg = { status: false, data: "Error! Please try again." };
                return cb(null, msg);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Schools.remoteMethod(
        'getQuizSetSchools',
        {
            http: { path: '/getquizsetschools', verb: 'post' },
            description: 'Get quiz set schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.getActiveSchools = function (data, cb) {
        let msg = {};

        Schools.find({
            where: {
                and:
                    [
                        { status: 1 },
                        { id: { neq: 1 } }
                    ]
            }
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Schools.remoteMethod(
        'getActiveSchools',
        {
            http: { path: '/getschools', verb: 'post' },
            description: 'Get schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Schools.getSchoolsList = function (data, cb) {
        let msg = {};
        let showSchool = ['superadmin', 'admin']
        let type_name = (data.type_name == undefined || data.type_name == null || data.type_name == '' ? undefined : data.type_name);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let school_code = (data.school_code == undefined || data.school_code == null || data.school_code == '' ? undefined : data.school_code);
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_name = (data.school_name == undefined || data.school_name == null || data.school_name == '' ? undefined : new RegExp(data.school_name, "i"));
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);
        let cond = '';

        if (type_name == undefined || !showSchool.includes(type_name)) {
            msg = { status: false, message: "Please provide user type" };
            return cb(null, msg);
        }

        if (country_id != undefined) {
            country_id = { inq: country_id }
        }

        // console.log("offset", offset, "limit", limit);
        Schools.find({
            where: {
                and:
                    [
                        { school_name: school_name },
                        {school_code : school_code},
                        {country_id : country_id},
                        {status : status}

                    ]
            }
        }, function (err, response) {
            if (err) {
                return cb(null, err);
            }

            Schools.find({
                where: {
                    and:
                        [
                            { school_name: school_name },
                            {school_code : school_code},
                            {country_id : country_id},
                            {status : status}
                        ]
                }, 
                order: 'school_name ASC', 
                skip: offset, 
                limit: limit,
                include: [
                    {
                        relation: "schoolCountry",
                        scope: {
                            fields: ['id', 'countryName']
                        }
                    },
                ]
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, total_school: response.length };
                return cb(null, msg);
            });

        });


    }


    Schools.remoteMethod(
        'getSchoolsList',
        {
            http: { path: '/getSchoolsList', verb: 'post' },
            description: 'Get schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Schools.createdSchool = function (data, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_name = (data.school_name == undefined || data.school_name == null || data.school_name == '' ? undefined : data.school_name);
        let address = (data.address == undefined || data.address == null || data.address == '' ? undefined : data.address);
        let status = (data.status == undefined || data.status == null || data.status == '' ? undefined : data.status);
        let school_code = (data.school_code == undefined || data.school_code == null || data.school_code == '' ? undefined : data.school_code);
        let school_logo = (data.school_logo == undefined || data.school_logo == null || data.school_logo == '' ? undefined : data.school_logo);
        let publish_status = (data.publish_status == undefined || data.publish_status == null ? undefined : data.publish_status);

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_name == undefined) {
            msg = { status: false, message: "Please provide school name" };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        if (school_code == undefined) {
            msg = { status: false, message: "Please provide school code" };
            return cb(null, msg);
        }

        if (publish_status == undefined) {
            msg = { status: false, message: "Please provide publish status" };
            return cb(null, msg);
        }

        let newSchool = {
            country_id: country_id,
            school_name: school_name,
            address: address,
            publish_status: publish_status,
            status: status,
            school_code: school_code,
            school_logo: school_logo
        }
        Schools.upsertWithWhere({ school_name: school_name, school_code: school_code },
            newSchool, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result };
                return cb(null, msg);
            });
    }

    Schools.remoteMethod(
        'createdSchool',
        {
            http: { path: '/createdSchool', verb: 'post' },
            description: 'Get schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.getSchoolById = function (data, cb) {
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        // let 
        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        Schools.findOne({
            where: {
                id: school_id
            },
            include: [
                {
                    relation: "schoolCountry",
                    scope: {
                        fields: ["id", "countryName"],
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

    Schools.remoteMethod(
        'getSchoolById',
        {
            http: { path: '/getSchoolById', verb: 'post' },
            description: 'Get school by id',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.updateSchool = function (data, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let school_name = (data.school_name == undefined || data.school_name == null || data.school_name == '' ? undefined : data.school_name);
        let address = (data.address == undefined || data.address == null || data.address == '' ? undefined : data.address);
        let status = (data.status == undefined || data.status == null ? undefined : data.status);
        let school_code = (data.school_code == undefined || data.school_code == null || data.school_code == '' ? undefined : data.school_code);
        let school_logo = (data.school_logo == undefined || data.school_logo == null || data.school_logo == '' ? undefined : data.school_logo);
        let publish_status = (data.publish_status == undefined || data.publish_status == null ? undefined : data.publish_status);

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        if (school_id == undefined) {
            msg = { status: false, message: "Please provide school id" };
            return cb(null, msg);
        }

        if (school_name == undefined) {
            msg = { status: false, message: "Please provide school name" };
            return cb(null, msg);
        }

        if (status == undefined) {
            msg = { status: false, message: "Please provide status" };
            return cb(null, msg);
        }

        if (school_code == undefined) {
            msg = { status: false, message: "Please provide school code" };
            return cb(null, msg);
        }

        if (publish_status == undefined) {
            msg = { status: false, message: "Please provide publish status" };
            return cb(null, msg);
        }

        let updateSchool = {
            country_id: country_id,
            school_name: school_name,
            address: address,
            publish_status: publish_status,
            status: status,
            school_code: school_code,
            school_logo: school_logo
        }

        Schools.update({ id: school_id }, updateSchool, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Schools.remoteMethod(
        'updateSchool',
        {
            http: { path: '/updateSchool', verb: 'post' },
            description: 'update School',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.getSuggestSchools = function (data, cb) {
        let msg = {};
        let school_name = (data.school_name == undefined || data.school_name == null || data.school_name == '') ? undefined : new RegExp(data.school_name, "i");

        Schools.find({ where: { school_name: school_name } }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Schools.remoteMethod(
        'getSuggestSchools',
        {
            http: { path: '/getSuggestSchools', verb: 'post' },
            description: 'get Suggest Schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.getCountrySchool = function (data, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let cond = {}

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        } else {
            cond.country_id = country_id;
        }

        if (school_id != undefined) {
            cond.id = { inq: school_id }
        }
        cond.status = 1;
        Schools.find({
            where: cond,
            include: [
                {
                    relation: "schoolCountry",
                    scope: {
                        fields: ["id", "countryName"],
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

    Schools.remoteMethod(
        'getCountrySchool',
        {
            http: { path: '/getCountrySchool', verb: 'post' },
            description: 'Get school by country',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.getSchoolByCode = function (data, cb) {
        let msg = {};
        let school_code = (data.school_code == undefined || data.school_code == null || data.school_code == '' ? undefined : data.school_code);
        // let 
        if (school_code == undefined) {
            msg = { status: false, message: "Please provide school code" };
            return cb(null, msg);
        }

        Schools.findOne({
            where: {
                school_code: school_code
            }
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Schools.remoteMethod(
        'getSchoolByCode',
        {
            http: { path: '/getSchoolByCode', verb: 'post' },
            description: 'Get school by code',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schools.tutorCreatSchool = function (data, cb) {
        let msg = {};
        let country_id = (data.country_id == undefined || data.country_id == null || data.country_id == '' ? undefined : data.country_id);
        let firstName = (data.firstName == undefined || data.firstName == null || data.firstName == '' ? undefined : data.firstName);

        if (country_id == undefined) {
            msg = { status: false, message: "Please provide country id" };
            return cb(null, msg);
        }

        let newSchool = {
            country_id: country_id,
            school_name: firstName + ' ' + 'Tutor',
            status: 5
        }
        Schools.upsert(newSchool, function (err, result) {
            if (err) {
                msg = { status: false, message: err.message };
                return cb(null, msg);
            }
            let obj = {
                status: 1,
                school_code: 'MRKS' + result.id
            }
            Schools.upsertWithWhere({ id: result.id }, obj, function (error, res) {
                if (error) { 
                    msg = { status: false, message: error.message };
                    return cb(null, msg) 
                }
                msg = { status: true, data: res };
                return cb(null, msg);
            })
        });
    }

    Schools.remoteMethod(
        'tutorCreatSchool',
        {
            http: { path: '/tutorCreatSchool', verb: 'post' },
            description: 'tutor create schools',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
