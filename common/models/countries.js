'use strict';

module.exports = function(Countries) {

    Countries.getCountries = function (data, cb) {
        let msg = {};

        Countries.find({where : {status: 1}}, function (err, result) {
            if (err) {
                console.log(err);
                return cb(null, err);
            }
            msg = { status: true, data: result };
            return cb(null, msg);
        });
    }

    Countries.remoteMethod(
        'getCountries',
        {
            http: { path: '/getCountries', verb: 'post' },
            description: 'Get Countries',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { root: true, type: 'json' }
        }
    );

    Countries.generateRandomNum = function (country_id, cb)  {
		let msg = {};

		Countries.findOne({where: {id: country_id}}, function(err, countryVal) {
			if(err){
				msg.status = false;
				msg.message = err.message;
				cb(null, msg);
			}

			if(countryVal){
				let curDate = new Date();
				let curTime = curDate.getTime().toString();
				let numRange = Math.floor((Math.random() * 100000) + 1);
                let randStr = random(2); //Get 2 random characters;
                let first = randStr.charCodeAt(0);
                let second = randStr.charCodeAt(1);
				msg.status = true;
				msg.randomNumber = countryVal.countryCode+'-000'+numRange+curTime.substring(curTime.length-6)+first+second;
				return cb(null, msg);
			} else {
				msg.status = true;
				msg.data = [];
				msg.message = "No record found.";
			}
		});

	}

	Countries.remoteMethod(
		'generateRandomNum',
		{
			http: { path: '/getrandomnum', verb: 'post' },
			description: 'Generate random number',
			accepts: [{ arg: 'country_id', type: 'number', required: true }],
			returns: { root: true, type: 'json' }
		}
	);

    const random = (length = 8) => {
        // Declare all characters
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
        // Pick characers randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    
        return str;
    
    };

};
