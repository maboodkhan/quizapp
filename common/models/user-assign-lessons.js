'use strict';
const request = require('request');
const SETTINGS = require('../../server/system-config');
//const magentoUrl = 'http://shop.marksharks.com/';
const magentoUrl = SETTINGS.SETTINGS.magentoUrl;

module.exports = function (Userassignlessons) {

    Userassignlessons.addUserLessons = async function (data, cb) {
        let msg = {};
        // console.log(data);
        let grade_id = (data.grade_id == undefined || data.grade_id == null || data.grade_id == '') ? undefined : data.grade_id;
        let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        let assigned_by = (data.assigned_by == undefined || data.assigned_by == null || data.assigned_by == '') ? undefined : data.assigned_by;

        if (user_id == undefined) {
            msg = { status: false, message: "Please provide user id." };
            return cb(null, msg);
        }

        if (lesson_id == undefined) {
            msg = { status: false, message: "Please provide lesson id." };
            return cb(null, msg);
        }

        if (assigned_by == undefined) {
            msg = { status: false, message: "Please provide assigned by id." };
            return cb(null, msg);
        }

        if (grade_id == undefined) {
            msg = { status: false, message: "Please provide grade id." };
            return cb(null, msg);
        }
        let grade = grade_id.join();

        

        try {
        // user.find({where: { id: {inq: user_id} }}, function (err, result) {
        //     if (err) { return cb(null, err); }
        //     console.log(result.toJSON());
            let sku = "CBSE_G10_INT_"+lesson_id.length; 
            let getUserEmails = await getUsers(user_id);
            let getQuizUserData = await getQuizUsers(getUserEmails);
            let oldLessonIds = await getOldLessonIds(lesson_id);
            let token = await magentoToken();
            let skuDetails = await getSkuDetails(sku);
            let duration = skuDetails.duration;
            let productName = skuDetails.name;
            let getSubscribedUsers = [];
            for(const email of getQuizUserData) {
                // console.log(email);
                let customerDetails = await getCustomerDetails(token, email);
                let cartId = await createCart();
                let cartItem = await addCartItem(token, cartId, sku, oldLessonIds);
                let billingAddress = await addBillingAddress(token, cartId, customerDetails.items[0]);
                let orderId = await placeOrder(token, cartId, customerDetails.items[0]);
                let orderStatus = await setOrderStatus(token, orderId);
                let subscribeUser = await postSubscription(email, orderId, duration, grade_id, oldLessonIds, productName);
                getSubscribedUsers.push(subscribeUser);
                let assignUser = assignUsers(email, lesson_id, assigned_by);
            }
            
           // console.log(skuDetails);
            if(getQuizUserData.length<1){
                msg.status = false;
                msg.message = "Users are not subscribed to MarkSharks application.";
            } else  if(getQuizUserData.length != getUserEmails.length){
                msg.status = false;
                let getSubsUsers = getUserEmails.filter(value => !getSubscribedUsers.includes(value));
                msg.message = "Lessons to "+getSubsUsers+" have not been subscribed to MarkSharks application. Please try again."
            } else {
                // console.log(getQuizUserData.length+" != "+getUserEmails.length);
                msg.status = true;
                msg.message = "All the selected lessons have been assigned successfully."
            }
            return msg;
        } catch(error) {
            console.log(error);
            msg.status = false;
            msg.message = error;
            return msg;
        }
    }

    Userassignlessons.remoteMethod(
        'addUserLessons',
        {
            http: { path: '/addUserLessons', verb: 'post' },
            description: 'Assign lesson to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUservalid = (user_id) => {
        return new Promise((resolve, reject) => {
            let flag = 0;
            user_id.forEach(userId => {
                user.findOne({ where: { id: userId }}, function (err, result) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    if (result) {
                        let email = result.email;
                        quizUser.findOne({where: { email: email }}, function (err, response) {
                            if (err) {
                                console.log(err);
                                reject(err);
                            }
                            if (response == null) {
                                flag = 1;
                            }
                        });
                    }else{
                        flag = 1;
                    }
                })
            });
            msg = { status: false, message: "user can not assigned", data: result };
            reject(msg);
            
        })
    }

    Userassignlessons.getUserLessons = function (data, cb) {
        let msg = {};
        // console.log(data);
        // let user_id = (data.user_id == undefined || data.user_id == null || data.user_id == '') ? undefined : data.user_id;
        // let lesson_id = (data.lesson_id == undefined || data.lesson_id == null || data.lesson_id == '') ? undefined : data.lesson_id;
        // let assigned_by = (data.assigned_by == undefined || data.assigned_by == null || data.assigned_by == '') ? undefined : data.assigned_by;

        Userassignlessons.find({
            include: [
                {
                    relation: "users",
                    scope: {
                        where: { status: 1 },
                        fields: ['firstName', 'lastName', 'user_type_id']
                    }
                },
                {
                    relation: "lesson",
                    scope: {
                        where: { status: 1 },
                        fields: ['lesson_name']
                    }
                },
                {
                    relation: "assignByUser",
                    scope: {
                        where: { status: 1 },
                        fields: ['firstName', 'lastName', 'user_type_id']
                    }
                },
            ]
        }, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Userassignlessons.remoteMethod(
        'getUserLessons',
        {
            http: { path: '/getUserLessons', verb: 'post' },
            description: 'Assign lesson to users',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    let getUsers = (userIds) => {
        return new Promise((resolve, reject) => {
            let user = Userassignlessons.app.models.user;        
            user.find({where: { id: {inq: userIds} }}, function (err, result) {
                if(err) {
                    reject(err);
                } 
                
                let userEmails = [];
                result.forEach(res => {                    
                    userEmails.push(res.email);
                });
                // console.log(userEmails);
                resolve(userEmails);
            });
        });
    }

    let getQuizUsers = (userEmails) => {
        return new Promise((resolve, reject) => {
            let quizUser = Userassignlessons.app.models.quiz_user;
            quizUser.find({where: { email: {inq: userEmails} }}, function (err, result) {
                if(err) {
                    reject(err);
                } 
                let userEmails = [];
                result.forEach(res => {
                    userEmails.push(res.email);
                });
                if(userEmails.length<1) {
                    reject("Users' are not registered in MarkSharks app.")
                }
                resolve(userEmails);
            })
        });
    }

    // let parseUserEmails = (userEmails) => {
    //     return new Promise((resolve, reject) => {
    //         userEmails.
    //     });
    // }
    let getOldLessonIds = (lesson_id) => {
        return new Promise((resolve, reject) => {
            let lessons = Userassignlessons.app.models.lessons; 
                
            lessons.find({where: { id: {inq: lesson_id} }}, function (err, result) {
                if(err) {
                    reject(err);
                } 
                
                let oldLessonIds = [];
                result.forEach(res => {         
                    oldLessonIds.push(res.old_record_id);
                });
                // console.log(userEmails);
                resolve(oldLessonIds);
            });
        });
    }


    let magentoToken = (orderID, lesson_id) => {
        return new Promise((resolve, reject) => {
            let url = magentoUrl+"index.php/rest/V1/integration/admin/token";
            let credentials = {
                "username": "sid",
                "password": "!admin123!"
            };
            let contentLength = credentials.length;
            request.post({
                "headers": { 
                    "Content-Type": "application/json",
                    "Content-Length": contentLength
                },
                "url": url, 
                "json": credentials
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    if(res.body) {  
                        if(res.body.message) {  
                            reject("Error in assigning Lesson. Please try again.");                               
                        } else {
                            resolve(res.body);   
                        }
                    }
            });
        });
    }

    let getSkuDetails = (sku) => {
        return new Promise((resolve, reject) => {
            // console.log(sku);
            // sku = "G8_CBSE_12M";
            // let url = 'http://shop.marksharks.com/rest/V1/products/'+sku;
            let url = magentoUrl+'rest/V1/products/'+sku;
            request.get({                
                "url": url
            }, function (err, res) {
                if(err){ 
                    // console.log(err);
                    reject(err);
                }
                if(res.body) {    
                    let body = JSON.parse(res.body);        
                    if(body.id) {     
                        let customAttributes = body.custom_attributes;
                        customAttributes.forEach((objValue) => {
                            if(objValue.attribute_code == 'duration'){
                                body.duration = objValue.value;
                            }
                        });                        
                        resolve(body);
                    } else {
                        reject("Error in assigning Lesson. Please try again.");
                    }
                }
                // resolve(res);
            });            
        });
    }

    let getCustomerDetails = (token, email) => {
        // console.log(token);
        return new Promise((resolve, reject) => {
            // let url = `http://35.189.154.76/index.php/rest/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=email&searchCriteria[filter_groups][0][filters][0][value]=${email}`
            let url = magentoUrl+`index.php/rest/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=email&searchCriteria[filter_groups][0][filters][0][value]=${email}`;
            // console.log(url);
            request.get({
                "headers": { 
                    "Authorization": `Bearer ${token}`
                },
                "url": url
            }, function (err, res) {
                if(err){ 
                    console.log(err);
                    reject(err);
                }
                if(res.body) {    
                    let body = JSON.parse(res.body);        
                    if(body.total_count) {  
                        // console.log(res);
                        resolve(body);      
                    } else {
                        reject("Error in assigning Lesson. Please try again.");
                    }
                }
                resolve(res.body);
            });            
        });
    }

    let createCart = () => {
        return new Promise((resolve, reject) => {
            let url = magentoUrl+"rest/V1/guest-carts";
            request.post({
                "headers": { 
                    "Content-Type": "application/json"
                },
                "url": url
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    
                    resolve(res.body);
            });
        });
    }

    let assignCart = (token, cartId, customerId) => {
        return new Promise((resolve, reject) => {
           
            let url = magentoUrl+"rest/V1/guest-carts/"+cartId;
            // console.log(url);
            request.put({
                "headers": { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "url": url,
                "json": {customerId:customerId, storeId: 1}
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    
                    reject(res.body);
            });
        });
    }

    let addCartItem = (token, cartId, sku, lesson_id) => {
        return new Promise((resolve, reject) => {
          cartId = cartId.replace(/"/g,'');
            let url = magentoUrl+`rest/V1/guest-carts/${cartId}/items`;
            // console.log(url);
            let cartItems = {
                cartItem: {
                    sku: sku,
                    qty: "1",
                    quote_id: cartId,
                    "productOption":{
                        "extensionAttributes":{
                            "customOptions":[
                                {
                                    "optionId":"lesson_id",
                                    "optionValue":lesson_id.join()
                                }
                            ]
                        }
                    }
                }
            }
            // console.log(cartItems);
            request.post({
                "headers": { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "url": url,
                "json": cartItems
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    
                    if(res.body) {                            
                        if(res.body.item_id) {  
                            resolve(res.body);      
                        } else {
                            reject("Error in assigning Lesson. Please try again.");
                        }
                    }
            });
        });
    }

    let addBillingAddress = (token, cartId, customerDetails) => {
        return new Promise((resolve, reject) => {
          cartId = cartId.replace(/"/g,'');
            let url = magentoUrl+`rest/V1/guest-carts/${cartId}/billing-address`;
            // console.log(customerDetails);
            let orderItems = {
                "address" : {
                    "region": "",
                    "region_id": 0,
                    "region_code": "",
                    "country_id": "IN",
                    "street": ["Kalkaji"],  
                    "city": "New Delhi",       
                    "postcode": "110019",           
                    "telephone": "7835856826",
                    "firstname": customerDetails.firstname,
                    "lastname": "lastname",
                    "middlename": "",
                    "customer_id": customerDetails.id,
                    "email": customerDetails.email   
                },
                "useForShipping": true             
            }
            // console.log(orderItems);
            request.post({
                "headers": { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "url": url,
                "json": orderItems
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    // console.log(res.body);
                    if(res.body) {  
                        if(res.body.message) {  
                            reject("Error in assigning Lesson. Please try again.");                               
                        } else {
                            resolve(res.body);   
                        }
                    }
            });
        });
    }

    let placeOrder = (token, cartId, customerDetails) => {
        return new Promise((resolve, reject) => {
          cartId = cartId.replace(/"/g,'');
            let url = magentoUrl+`rest/V1/guest-carts/${cartId}/order`;
            // console.log(url);
            // console.log(customerDetails);
            let orderItems = {
                "paymentMethod": {
                    "method": "paynimo",
                    "additional_data": null
                }
            }
            // console.log(orderItems);
            request.put({
                "headers": { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "url": url,
                "json": orderItems
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    if(res.body) {   
                        // console.log(res.body); 
                        if(res.body.message) {  
                            reject("Error in assigning Lesson. Please try again.");                               
                        } else {
                            resolve(res.body);   
                        }
                    }
            });
        });
    }

    let setOrderStatus = (token, orderId) => {
        return new Promise((resolve, reject) => {
            let url = magentoUrl+`rest/V1/orders`;
            let orderItems = {
                "entity": {
                    "entity_id": orderId,
                    "status": "complete"
            
                }
            }
            // console.log(orderItems);
            request.post({
                "headers": { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                "url": url,
                "json": orderItems
            }, function (err, res) {
                    if(err){ 
                        console.log(err);
                        reject(err);
                    }
                    //  reject(JSON.stringify(res.body));
                    if(res.body) {    
                        // let body = JSON.parse(res.body); 
                        // console.log(res.body); 
                        if(res.body.entity_id) {  
                            resolve(res.body);      
                        } else {
                            reject("Error in assigning Lesson. Please try again.");
                        }
                    }
            });
        });
    }

    let postSubscription = (email, orderId, duration, grade, lesson_id, productName) => {
        return new Promise((resolve, reject) => {
            email, grade, lesson_id
            let subsEmails = [];
            //let url = 'http://sp.marksharks.com/api/jsonws/markshark-services-portlet.mspgtransaction/create-and-save-transaction-magento2';
            let url = SETTINGS.SETTINGS.liferay_transaction_magento;
            // userEmails.forEach((userEmail) => {
            let date = new Date()
            let modifiedDate = date.toISOString().slice(0, 10);
            let subsriptionData = {
                productId: "9",
                productType: "virtual",
                amount: "1",
                orderId: orderId,
                userEmail: email,
                paymentMethod: "demo",
                bankRefNumber: "" + date.valueOf(),
                productName: productName,
                productDescription: productName,
                duration: duration,
                status: "complete",
                data: "0",
                board: "cbse",
                grade: grade.join(),
                subjectId: 0,
                startDate: modifiedDate,
                lesson_id: lesson_id.join()
            };
            let contentLength = subsriptionData.length;
            // console.log(subsriptionData);
            request.post({
                "headers": { 
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": contentLength
                },
                "url": url, 
                "form": subsriptionData
            }, function (err, res) {
                if(err){ 
                    console.log(err);
                    reject(err.message);
                }
                if(JSON.parse(res.body).exception){
                    // console.log(JSON.parse(res.body).exception);
                    // reject(JSON.parse(res.body).exception);
                    resolve(JSON.parse(res.body).exception);
                } else {
                    // console.log(email);
                    resolve(email);
                }
            }); 
        });
    }

    let assignUsers = (email, lesson_id, assigned_by) => {
        return new Promise((resolve, reject) => {
            let User = Userassignlessons.app.models.User;
            User.findOne({where:{email: email}}, function(err, userData) {
                if(err) {
                    reject(err.message);
                }
                let userId = userData.id;
                lesson_id.forEach(lessonId => {
                    
                    // Userassignlessons.destroyAll( {where:{user_id: userId}}, function (err, result) {
                        // if (err) {
                        //     console.log(err);    
                        //     return cb(null, err);
                        // }
                        let obj = {
                            lesson_id: lessonId,
                            user_id: userId,
                            assigned_by: assigned_by
                        }
                        Userassignlessons.upsertWithWhere({user_id: userId, lesson_id: lessonId}, obj, function (err, result) {
                            if (err) {
                                console.log(err);
                               reject(err.message);
                            }
                            resolve(result);
                        });
                    // });                    
                });
            });
        });
    }
};
