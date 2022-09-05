'use strict';

module.exports = function (Schooluserclasses) {

    Schooluserclasses.userClassSection = function (data, cb) {
        // console.log(data);
        let msg = {};
        let cond = {};
        let school_data_id = (data.school_data_id == undefined || data.school_data_id == null || data.school_data_id == '' ? undefined : data.school_data_id);

        // console.log(cond);
        Schooluserclasses.find({
            where: { school_data_id: school_data_id, status: 1 },
            include: [
                {
                    relation: "school",
                    scope: {
                        where: { status: 1 },
                    }
                },
                {
                    relation: "class",
                    scope: {
                        where: { status: 1 },
                    }
                },
                {
                    relation: "section",
                    scope: {
                        where: { status: 1 },
                        include: [
                            {
                                relation: "class_section",
                                scope: {
                                    where: { status: 1 },
                                }
                            }
                        ]
                    }
                }
            ]
        }, function (err, res) {

            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            msg.status = true;
            msg.data = res;
            // console.log(msg);
            return cb(null, msg);
        });

    }

    Schooluserclasses.remoteMethod(
        'userClassSection',
        {
            http: { path: '/userClassSection', verb: 'post' },
            description: 'Get User class and sections',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schooluserclasses.chkUseryEntry = function (data, cb) {
        // console.log(data);
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let user_id = (data.user_id == undefined || data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        // if (school_id == undefined) {
        //     msg = { status: false, message: "Please provide school id" };
        //     return cb(null, msg);
        // }

        // if (class_id == undefined) {
        //     msg = { status: false, message: "Please provide class id" };
        //     return cb(null, msg);
        // }

        // if (section_id == undefined) {
        //     msg = { status: false, message: "Please provide section id" };
        //     return cb(null, msg);
        // }

        Schooluserclasses.find(
            {
                where:
                {
                    school_id: school_id,
                    class_id: class_id,
                    section_id: section_id,
                    user_id: user_id,
                    status: 1
                }
            }, function (err, res) {

                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    return cb(null, msg);
                }
                if (res.length > 0) {
                    msg.status = true;
                    // msg.data = res;
                } else {
                    msg.status = false;
                    msg.message = "User entry does exists.";
                }
                // console.log(res);
                return cb(null, msg);
            });
    }

    Schooluserclasses.remoteMethod(
        'chkUseryEntry',
        {
            http: { path: '/chkUseryEntry', verb: 'post' },
            description: "Check user's details existence",
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schooluserclasses.getSchoolUserData = function (data, cb) {
        // console.log(data);
        let msg = {};
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '') ? undefined : data.section_id;
        let user_id = (data.user_id == undefined || data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id" };
            return cb(null, msg);
        }

        Schooluserclasses.find(
            {
                where:
                {
                    school_id: school_id,
                    class_id: class_id,
                    section_id: section_id,
                    user_id: user_id,
                    status: 1
                },
                include: [
                    {
                        relation: "school",
                        scope: {
                            where: { status: 1 },
                        }
                    },
                    {
                        relation: "class",
                        scope: {
                            where: { status: 1 },
                        }
                    },
                    {
                        relation: "subject",
                        scope: {
                            where: { status: 1 },
                        }
                    },
                    {
                        relation: "section",
                        scope: {
                            where: { status: 1 },
                            include: [
                                {
                                    relation: "class_section",
                                    scope: {
                                        where: { status: 1 },
                                    }
                                }
                            ]
                        }
                    }
                ]
            }, function (err, res) {

                if (err) {
                    console.log(err);
                    msg.status = false;
                    msg.message = err.message;
                    return cb(null, msg);
                }
                if (res.length > 0) {
                    msg.status = true;
                    msg.data = res;
                } else {
                    msg.status = false;
                    msg.message = "User entry does not exists.";
                }
                // console.log(res);
                return cb(null, msg);
            });
    }

    Schooluserclasses.remoteMethod(
        'getSchoolUserData',
        {
            http: { path: '/getSchoolUserData', verb: 'post' },
            description: "Get user's details existence",
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schooluserclasses.userSchools = function (data, cb) {
        let msg = {};
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '' ? undefined : data.user_id);

        if (user_id == undefined) {
            msg = {
                status: false,
                message: "Please provide user id"
            };
            return cb(null, msg);
        }
        Schooluserclasses.find({ where: { user_id: user_id } }, function (err, userSchool) {
            if (err) {
                msg = { status: false, message: err };
                return cb(null, msg);
            }
            let response = JSON.parse(JSON.stringify(userSchool));
            let school_id = [];
            let class_id = [];
            let section_id = [];
            response.forEach(element => {
                school_id.push(element.school_id);
                class_id.push(element.class_id);
                section_id.push(element.section_id);
            });
            school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
            class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
            section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
            let Schools = Schooluserclasses.app.models.schools;
            // let Schools = Userclasses.app.models.schools;

            Schools.find({ where: { id: { inq: school_id } } }, function (err, schoolData) {
                if (err) { return cb(null, err); }

                // console.log(response);
                msg = { status: true, data: schoolData, userClass: class_id, userSection: section_id };
                return cb(null, msg);
            });
        });
    }

    Schooluserclasses.remoteMethod(
        'userSchools',
        {
            http: { path: '/userSchools', verb: 'post' },
            description: "Get user's school, class, section list",
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schooluserclasses.getQuizStudent = function (data, cb) {
        let msg = {};
        let cond = {}
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '' ? undefined : data.school_id);
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '' ? undefined : data.class_id);
        let section_id = (data.section_id == undefined || data.section_id == null || data.section_id == '' ? undefined : data.section_id);

        if (school_id == undefined) {
            msg = { status: false, message: "please provide school_id" }
        } else {
            cond.school_id = { inq: school_id }
        }
        if (class_id != undefined) {
            cond.class_id = { inq: class_id }
        }
        if (section_id != undefined) {
            cond.section_id = { inq: section_id }
        }

        Schooluserclasses.find(
            {
                where: cond,
                include: [
                    {
                        relation: "quiz_user_data",
                        scope: {
                            where: { status: 1 },
                        }
                    }
                ]
            }, function (err, res) {

                if (err) {
                    console.log(err);
                    msg = { status: false, message: err }
                    return cb(null, msg);
                }
                res = res.filter((user, index, self) =>
                    index === self.findIndex((u) => (
                        u.user_id === user.user_id
                    ))
                )
                msg = { status: true, result: res }
                // console.log(res);
                return cb(null, msg);
            });

    }

    Schooluserclasses.remoteMethod(
        'getQuizStudent',
        {
            http: { path: '/getQuizStudent', verb: 'post' },
            description: 'Get Quiz Student',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Schooluserclasses.updateTrialSchool = function (data, cb) {
        // console.log(data);
        let msg = {};
        let quiz_user_id = (data.quiz_user_id == undefined || data.quiz_user_id == null || data.quiz_user_id == '' ? undefined : data.quiz_user_id);
        let trialSchoolId = (data.trialSchoolId == undefined || data.trialSchoolId == null || data.trialSchoolId == '' ? undefined : data.trialSchoolId);
        // let schoolId = (data.schoolId == undefined || data.schoolId == null || data.schoolId == '' ? undefined : data.schoolId);

        if (quiz_user_id == undefined) {
			msg.status = false;
			msg.message = "Please provide the user id";
			return cb(null,msg);
		}

        if (trialSchoolId == undefined) {
			msg.status = false;
			msg.message = "Please provide the old school id";
			return cb(null,msg);
		}

        // if (schoolId == undefined) {
		// 	msg.status = false;
		// 	msg.message = "Please provide the school id";
		// 	return cb(null,msg);
		// }
        // console.log(cond);
        let schoolId = 7;
        Schooluserclasses.update(
        { 
            school_id: trialSchoolId,
            user_id: quiz_user_id
        },
        {school_id: schoolId}
        ,function (err, res) {

            if (err) {
                console.log(err);
                msg.status = false;
                msg.message = err.message;
                return cb(null, msg);
            }
            msg.status = true;
            msg.message = "Record updated successfully.";
            // console.log(msg);
            return cb(null, msg);
        });

    }

    Schooluserclasses.remoteMethod(
        'updateTrialSchool',
        {
            http: { path: '/updateTrialSchool', verb: 'post' },
            description: 'Move user from Marksharks trial school to OKS School',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
