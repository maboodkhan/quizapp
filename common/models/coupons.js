'use strict';
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser')
const DIR = './uploads';

module.exports = function (Coupons) {

    // Coupons.couponUpload = function (req, res, cb) {
    //     // console.log(req);
    //     fs.readFile(req, {
    //         encoding: 'utf-8'
    //     }, function (err, csvData) {
    //         if (err) {
    //             console.log(err);
    //         }

    //         csvParser(csvData, {
    //             delimiter: ','
    //         }, function (err, data) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log(data);
    //             }
    //         });
    //     });
    // }

    Coupons.couponUpload = function (req, res, cb) {
        let storage = multer.diskStorage({
            destination: (req, res, cb) => {
                if (!fs.existsSync(DIR)) {
                    var dir = fs.mkdirSync(DIR);
                }
                cb(null, DIR);
            },
            filename: (req, file, cb) => {
                let origFName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
                cb(null, origFName);
            }
        });
        var upload = multer({
            storage: storage
        }).array('file', 12);

        var message = {};
        var extName = '';
        const results = [];
        var successMessage = {};
        var headers1 = ['S.No', 'couponCode', 'schoolName', 'expiration_type', 'expiration_date', 'num_days', 'num_attempts'];
        upload(req, res, function (err) {
            if (err) {
                cb(null, err);
            }
            // console.log(req.files);
            fs.createReadStream(req.files[0].path)
                .pipe(csvParser({
                    mapHeaders: ({ header, index }) => {
                        header = header.trim();
                        if (headers1.indexOf(header) > 0) { return header; } else { return null; } //To remove extra headers from csv
                    },
                    mapValues: ({ header, index, value }) => {
                        if (value === '') {
                            return null;
                        }
                        if (header == 'expiration_date') {
                            if (value === null || value == 'null') {
                                return null;
                            }
                            if (value === '') {
                                return null;
                            } else {
                                value = new Date(value);
                            }
                        }
                        return value;
                    }
                }))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    var Schoolcoupons = Coupons.app.models.school_coupons;
                    var Schools = Coupons.app.models.schools
                    var uploadFilename = "upload-" + Date.now() + ".txt";
                    var uploadFile = DIR + "/" + uploadFilename;
                    fs.open(uploadFile, 'w', function (err, file) {
                        if (err) throw err;
                    });
                    let iVal = 0;
                    // console.log(results);
                    results.forEach((row, index) => {
                        iVal++;
                        index = index + 2;
                        if (!row.couponCode) {
                                fs.appendFile(uploadFile, "Row number " + index + " : Coupon Code not given,", function (err, data) {
                                });
                        }else if (!row.expiration_type || row.expiration_type > 2 || row.expiration_type < 1) {
                                fs.appendFile(uploadFile, "Row number " + index + " : Invalid Expiration Type,", function (err, data) {
                                });
                        }else if (!row.num_days && !row.expiration_date) {
                                fs.appendFile(uploadFile, "Row number " + index + " : Invalid Expiration Date or Num days,", function (err, data) {
                                });
                        }else if (!row.num_attempts) {
                            fs.appendFile(uploadFile, "Row number " + index + " : Invalid number of attempts,", function (err, data) {
                            });
                    }
                         else {
                            let insVal = true;
                            // row.schoolName = row.schoolName.trim();
                            row.created_on = new Date();
                            Coupons.find({ where: { couponCode: row.couponCode } }, function (err, couponVal) {
                                if (err) {
                                    insVal = false;
                                    fs.appendFile(uploadFile, "Row number " + index + " : Invalid dataSource" + ",", function (err, data) {

                                    });
                                }
                                if (couponVal.length > 0) {
                                    insVal = false;
                                    fs.appendFile(uploadFile, "Row number " + index + " : Coupon already exists" + ",", function (err, data) {
                                    });
                                } else {
                                    if (row.num_days == null) {
                                        row.num_days = 0;
                                    }

                                    Schools.findOne({ where: { school_name: row.schoolName } }, function (err, res) {
                                        if (err) {
                                            insVal = false;
                                            fs.appendFile(uploadFile, "Row number " + index + " : Invalid dataSource" + ",", function (err, data) {
                                            });
                                        } if (!res) {
                                            insVal = false;
                                            fs.appendFile(uploadFile, "Row number " + index + " : Invalid School Name" + ",", function (err, data) {
                                            });
                                        } else {
                                            Coupons.create(row, function (err, couponVal) {
                                                if (err) {
                                                    console.log(err);
                                                    fs.appendFile(uploadFile, "Row number " + index + " : " + err + ",", function (err, data) {
                                                    });
                                                }
                                                let schoolCouponObj = {
                                                    coupon_id: couponVal.id,
                                                    school_id: res.id
                                                }
                                                Schoolcoupons.create(schoolCouponObj, function (err, cupnSchool) {
                                                    if (err) {
                                                        fs.appendFile(uploadFile, "Row number " + index + " : Invalid dataSource" + ",", function (err, data) {
                                                        });
                                                    }
                                                })
                                            })
                                        }
                                    })
                                }
                            })
                        }

                    });
                    if (iVal == results.length) {
                        // console.log(iVal+"=="+results.length);
                        fs.readFile(uploadFile, "utf8", function (err, data) {
                            // if(err) console.log(err);                                                           
                            successMessage = { 'status': true, 'message': 'Data has been imported successfully.', "file": uploadFilename };
                            cb(null, successMessage);
                        });
                    }
                });
        });
    }

    Coupons.remoteMethod(
        'couponUpload',
        {
            http: { path: '/couponUpload', verb: 'post' },
            description: 'Upload Coupons',
            accepts: [
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: { arg: 'response', type: 'json' }
        }
    );

    Coupons.getImportDetails = function (file, cb) {
        var uploadFile = DIR + "/" + file;
        fs.readFile(uploadFile, 'utf-8', function (err, data) {
            if (err) {
                return cb(null, err);
            }
            cb(null, data);
        });
    }

    Coupons.remoteMethod(
        'getImportDetails',
        {
            http: { path: '/getImportDetails/:file', verb: 'get' },
            description: 'Get import lead details',
            accepts: [{ arg: 'file', type: 'string', required: true }],
            returns: { arg: 'response', type: 'json' }
        }
    );


    Coupons.getCouponsList = function (data, cb) {
        let msg = {};
        let limit = (data.limit == undefined || data.limit == null || data.limit == '' ? 10 : data.limit);
        let offset = (data.offset == undefined || data.offset == null || data.offset == '' ? 0 : data.offset);

        Coupons.find({ where: { status: 1 } }, function (err, response) {
            if (err) {
                return cb(null, err);
            }
            Coupons.find({
                where: { status: 1 },
                skip: offset,
                limit: limit,
                order: "id desc",
            }, function (err, result) {
                if (err) {
                    return cb(null, err);
                }
                msg = { status: true, data: result, total_coupons: response.length };
                return cb(null, msg);
            });
        });
    }

    Coupons.remoteMethod(
        'getCouponsList',
        {
            http: { path: '/getCouponsList', verb: 'post' },
            description: 'Get Coupons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getSubjectDetails = (subject_id) => {
        return new Promise((resolve, reject) => {
            var ds = Coupons.dataSource;
            let params;
            let cond = "where 1";
            if(subject_id.length > 0) {
                let subject_ids = subject_id.join();
                cond += " and id in ("+subject_ids+")";
            }
           
            var sql = `SELECT class_id, id as subject_id FROM subjects ${cond}`;

            return ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    let getLessonDetails = (lesson_id) => {
        return new Promise((resolve, reject) => {
            var ds = Coupons.dataSource;
            let params;
            let cond = "where 1";
            if(lesson_id.length > 0) {
                let lesson_ids = lesson_id.join();
                cond += " and l.id in ("+lesson_ids+")";
            }
           
            var sql = `SELECT s.class_id, l.subject_id, l.id as lesson_id FROM lessons l join subjects s on l.subject_id = s.id ${cond}`;

            return ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    let getCouponDetails = (coupon_id, class_id, subject_id) => {
        return new Promise((resolve, reject) => {
            var ds = Coupons.dataSource;
            let params;
            let cond = "where 1";
            if(coupon_id != undefined && coupon_id != '') {
                cond += " and coupon_id = '"+coupon_id+"'";
            }
            if(class_id != undefined && class_id != '') {
                cond += " and class_id = '"+class_id+"'";
            }
            if(subject_id != undefined && subject_id != '') {
                cond += " and subject_id = '"+subject_id+"'";
            }
           
            var sql = `SELECT class_id, subject_id, lesson_id FROM coupon_details ${cond} limit 1`;
            //console.log(sql);
            return ds.connector.query(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    Coupons.createCoupon = function (data, cb) {
        //console.log(data);return false;
        let msg = {};
        let couponCode = (data.couponCode == undefined || data.couponCode == null || data.couponCode == '') ? undefined : data.couponCode;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let expiration_type = (data.expiration_type == undefined || data.expiration_type == null || data.expiration_type == '') ? undefined : data.expiration_type;
        let expiration_date = (data.expiration_date == undefined || data.expiration_date == null || data.expiration_date == '') ? undefined : data.expiration_date;
        // let num_days = (data.num_days == undefined || data.num_days == null || data.num_days == '') ? undefined : data.num_days;
        // let num_attempts = (data.num_attempts == undefined || data.num_attempts == null || data.num_attempts == '') ? undefined : data.num_attempts;
        let num_days = (data.num_days < 0 ) ? undefined : data.num_days;
        let num_attempts = (data.num_attempts < 0 ) ? undefined : data.num_attempts;
        let board_id = (data.board_id == undefined || data.board_id == null || data.board_id == '') ? undefined : data.board_id;
        let class_id = (data.class_id == undefined || data.class_id == null || data.class_id == '') ? undefined : data.class_id;
        let subject_id = (data.subject_id == undefined || data.subject_id == null || data.subject_id == '') ? undefined : data.subject_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;

        if (couponCode == undefined) {
            msg = { status: false, message: "Please provide coupon code." };
            return cb(null, msg);
        }

        if (expiration_type == undefined) {
            msg = { status: false, message: "Please provide expiration_type." };
            return cb(null, msg);
        }

        if (expiration_date == undefined && num_days == undefined) {
            msg = { status: false, message: "Please provide expiration_date or num_days." };
            return cb(null, msg);
        }

        if (num_attempts == undefined) {
            msg = { status: false, message: "Please provide Number of attempts." };
            return cb(null, msg);
        }

        let obj = {
            couponCode: couponCode,
            expiration_type: expiration_type,
            expiration_date: expiration_date,
            num_days: num_days,
            num_attempts: num_attempts,
            created_on: new Date()
        }
        Coupons.findOne({ where: { couponCode: couponCode } }, function (req, res) {
            if (!res) {
                Coupons.upsert(obj, async function (err, res) {
                    if (err) {
                        msg = { status: false, message: err };
                        return cb(null, msg);
                    }
                    if (school_id != undefined) {
                        let Schoolcoupons = Coupons.app.models.school_coupons;
                        school_id.forEach((schools_id) => {
                            let obj = {
                                coupon_id: res.id,
                                school_id: schools_id
                            }
                            Schoolcoupons.upsert(obj, function (err, response) {
                                if (err) {
                                    msg = { status: false, message: err };
                                    return cb(null, msg);
                                }
                            });
                        })
                    }

                    let Coupondetails = Coupons.app.models.coupon_details;
                    if (lesson_id != undefined) {
                        let lessonDetails = await getLessonDetails(lesson_id);
                        lessonDetails.forEach((lessonDetail) => {
                            let obj = {
                                coupon_id: res.id,
                                class_id: lessonDetail.class_id,
                                subject_id: lessonDetail.subject_id,
                                lesson_id: lessonDetail.lesson_id
                            }
                            Coupondetails.upsert(obj, function (err, response) {
                                if (err) {
                                    msg = { status: false, message: err };
                                    return cb(null, msg);
                                }
                            });
                        });
                    }
                    //console.log(subject_id);
                    if (subject_id != undefined) {
                        let subjectDetails = await getSubjectDetails(subject_id);
                        //console.log(subjectDetails);
                        //subjectDetails.forEach((subjectDetail) => {
                        for(let i=0; i<subjectDetails.length; i++) { 
                            let couponDetails = await getCouponDetails(res.id, subjectDetails[i].class_id, subjectDetails[i].subject_id);
                            //console.log(couponDetails);
                            if(couponDetails.length == 0) {
                                let obj = {
                                    coupon_id: res.id,
                                    class_id: subjectDetails[i].class_id,
                                    subject_id: subjectDetails[i].subject_id
                                }
                                Coupondetails.upsert(obj, function (err, response) {
                                    if (err) {
                                        msg = { status: false, message: err };
                                        return cb(null, msg);
                                    }
                                });
                            }
                        }
                        //});
                    }
                    if (class_id != undefined) {
                        //class_id.forEach((class_ids) => {
                        for(let i=0; i<class_id.length; i++) {     
                            let couponDetails = await getCouponDetails(res.id, class_id[i], '');
                            if(couponDetails.length == 0) {
                                let obj = {
                                    coupon_id: res.id,
                                    class_id: class_id[i]
                                }
                                Coupondetails.upsert(obj, function (err, response) {
                                    if (err) {
                                        msg = { status: false, message: err };
                                        return cb(null, msg);
                                    }
                                });
                            }
                        }
                        //});
                    }
                    msg = { status: true, data: res };
                    return cb(null, msg);
                })
            } else {
                msg = { status: false, message: "Coupon Code already used" };
                return cb(null, msg);
            }

        });


    }

    Coupons.remoteMethod(
        'createCoupon',
        {
            http: { path: '/createCoupon', verb: 'post' },
            description: 'create Coupons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    Coupons.editCoupon = async function (data, cb) {
        let msg = {};
        let coupon_id = (data.coupon_id == undefined || data.coupon_id == null || data.coupon_id == '') ? undefined : data.coupon_id;
        let couponCode = (data.couponCode == undefined || data.couponCode == null || data.couponCode == '') ? undefined : data.couponCode;
        let school_id = (data.school_id == undefined || data.school_id == null || data.school_id == '') ? undefined : data.school_id;
        let expiration_type = (data.expiration_type == undefined || data.expiration_type == null || data.expiration_type == '') ? undefined : data.expiration_type;
        let expiration_date = (data.expiration_date == undefined || data.expiration_date == null || data.expiration_date == '') ? undefined : data.expiration_date;
        // let num_days = (data.num_days == undefined || data.num_days == null || data.num_days == '') ? undefined : data.num_days;
        // let num_attempts = (data.num_attempts == undefined || data.num_attempts == null || data.num_attempts == '') ? undefined : data.num_attempts;
        let num_days = (data.num_days < 0 ) ? undefined : data.num_days;
        let num_attempts = (data.num_attempts < 0 ) ? undefined : data.num_attempts;

        if (coupon_id == undefined) {
            msg = { status: false, message: "Please provide coupon_id." };
            return msg;
        }

        if (couponCode == undefined) {
            msg = { status: false, message: "Please provide coupon code." };
            return msg;
        }

        if (expiration_type == undefined) {
            msg = { status: false, message: "Please provide expiration_type." };
            return msg;
        }

        if (expiration_date == undefined && num_days == undefined) {
            msg = { status: false, message: "Please provide expiration_date or num_days." };
            return msg;
        }

        if (num_attempts == undefined) {
            msg = { status: false, message: "Please provide Number of attempts." };
            return msg;
        }
        
        try {
            let addCoupon = await upsertCoupon(coupon_id, couponCode, expiration_type, expiration_date, num_days, num_attempts);
            if (addCoupon.status) {
                await destroySchoolCoupon(coupon_id);
            }
            if (addCoupon.status && school_id != undefined) {
                await upsertSchoolCoupon(coupon_id, school_id);
            }
            return addCoupon;
        } catch(error) {
            msg.status = false;
            msg.message = "Error! Please try again.";
            return msg;
        }
        
    }

    Coupons.remoteMethod(
        'editCoupon',
        {
            http: { path: '/editCoupon', verb: 'post' },
            description: 'edit Coupons',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );


    let upsertCoupon = (coupon_id, couponCode, expiration_type, expiration_date, num_days, num_attempts) => {
        return new Promise((resolve, reject) => {
            let msg = {};
            Coupons.findOne({
                where: {
                    couponCode: couponCode,
                    id: { neq: coupon_id }
                }
            }, function (req, res) {
                if (!res) {
                    let obj = {
                        created_on: new Date(),
                        couponCode: couponCode,
                        expiration_type: expiration_type,
                        expiration_date: expiration_date,
                        num_days: num_days,
                        num_attempts: num_attempts
                    }
                    Coupons.upsertWithWhere({ id: coupon_id }, obj, function (err, res) {
                        if (err) {
                            msg = { status: false, message: err };
                            reject(msg);
                        }
                        msg = { status: true, data: res };
                        resolve(msg);
                    })
                } else {
                    msg = { status: false, message: "Coupon Code already used" };
                    resolve(msg);
                }
            });
        });
    }

    let destroySchoolCoupon = (coupon_id) => {
        return new Promise((resolve, reject) => {
            let Schoolcoupons = Coupons.app.models.school_coupons;
            Schoolcoupons.destroyAll({ coupon_id: coupon_id }, function (err, rVal) {
                if (err) { reject(err) }
                resolve()
            });
        });
    }

    let upsertSchoolCoupon = (coupon_id, school_id) => {
        return new Promise((resolve, reject) => {
            let Schoolcoupons = Coupons.app.models.school_coupons;
            school_id.forEach((schools_id) => {
                let obj = {
                    coupon_id: coupon_id,
                    school_id: schools_id
                }
                Schoolcoupons.upsert(obj, function (err, response) {
                    if (err) { reject(err) }
                    resolve()
                });
            })
        });
    }

    Coupons.getCouponsById = function (data, cb) {
        let msg = {};
        let coupon_id = (data.coupon_id == undefined || data.coupon_id == null || data.coupon_id == '') ? undefined : data.coupon_id;

        if (coupon_id == undefined) {
            msg = { status: false, message: "Please provide coupon_id." };
            return cb(null, msg);
        }

        Coupons.findOne({
            where: { id: coupon_id },
            include: [
                {
                    relation: "coupon_School",
                    scope: {}
                },
                {
                    relation: "coupon_detail",
                    scope: {}
                },
            ]
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Coupons.remoteMethod(
        'getCouponsById',
        {
            http: { path: '/getCouponsById', verb: 'post' },
            description: 'Get Coupon by id',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

};
