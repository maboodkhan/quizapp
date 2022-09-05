'use strict';

module.exports = function(Couponusers) {

    Couponusers.couponUser = function (data, cb) {
        let msg = {};
        let couponCode = (data.couponCode == undefined || data.couponCode == null || data.couponCode == '') ? undefined : data.couponCode;
        let email = (data.email == undefined || data.email == null || data.email == '') ? undefined : data.email;
        let phone = (data.phone == undefined || data.phone == null || data.phone == '') ? undefined : data.phone;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let condUser = {};
        let condCouponUser = {};

        if (couponCode == undefined) {
            msg = { status: false, message: "Please provide coupon code." };
            return cb(null, msg);
        }

        if (email == undefined && phone == undefined && user_id == undefined) {
            msg = { status: false, message: "Please provide Email or Phone or User Id." };
            return cb(null, msg);
        }
        
        if (email != undefined) {
            condUser.email = email;
            condCouponUser.email = email;
        }
        if (phone != undefined) {
            condUser.contactNumber = phone;
            condCouponUser.phone = phone;
        }
        if (user_id != undefined) {
            condUser.id = user_id;
            condCouponUser.user_id = user_id;
        }
        if (couponCode != undefined) {
            condCouponUser.couponCode = couponCode;
        }
        let getUserDetail = (email, phone, user_id) => {
            return new Promise((resolve, reject) => {
                let Userdata = Couponusers.app.models.User;
                Userdata.findOne({
                    where: condUser,
                }, function (err, result) {
                    //console.log(result);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        let getCouponDetail = (couponCode) => {
            return new Promise((resolve, reject) => {
                let Coupondatas = Couponusers.app.models.Coupons;
                Coupondatas.findOne({
                    where: { couponCode: couponCode },
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        } 
        let getCouponUserDetail = (couponCode, email, phone, user_id) => {
            return new Promise((resolve, reject) => {
                Couponusers.findOne({
                    where: condCouponUser,
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }
        
        /*
        let userDetail = await getUserDetail(email, phone, user_id);
        if(userDetail != null) {
            user_id = userDetail.id;
            email = userDetail.email;
            phone = userDetail.contactNumber;
        }
        */
        let obj = {
            user_id: user_id,
            //coupon_id: couponDetail.id,
            email: email,
            phone: phone,
            couponCode: couponCode
        }
        Couponusers.upsert(obj, async function (err, response) {
            if (err) {
                //console.log(err);
                msg = { status: false, message: err };
                return cb(null, msg);
            } else {
                let couponDetail = await getCouponDetail(couponCode);
                if(couponDetail == null) {
                    msg = { status: false, message: "Wrong coupon code entered." };
                    return cb(null, msg);
                }

                let couponUserDetail = await getCouponUserDetail(couponCode, email, phone, user_id);
                if(couponUserDetail != null) {
                    msg = { status: false, message: "Entered coupon code already used by current user." };
                    return cb(null, msg);
                }

                //console.log(response);
                msg = {status:true,message:"Success"};
                //msg = { status: true, data: response };
                return cb(null, msg);
            }
        });
    }
    
    Couponusers.remoteMethod(
        'couponUser',
        {
            http: { path: '/couponUser', verb: 'post' },
            description: 'User accessing coupon',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );
        
};
