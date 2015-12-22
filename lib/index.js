var Joi = require('joi');

function Conformity () {
    this.logger = console.log;
    this.validator = Joi;
}

Conformity.prototype.handleFailure = function (req, res, next) {
    return function (status, callback) {
        return callback(status.error, status.body);
    }
}

Conformity.prototype.validate = function (){
    var self = this;

    return function (req, res, next) {
        var validate = {};
        try {
            validate = req.route.stack[req.route.stack.length - 1].handle.validate
        } catch (e) {
            console.log(e);
            return next();
        }

        if (validate) {
            var toValidate = {'query':'query', 'path':'params', 'payload': 'body'}
            var handleFailure = self.handleFailure(req, res, next);

            var keys = Object.keys(toValidate);
            var l = keys.length;
            for(var i = 0; i < l; i++) {
                if (validate[keys[i]]) {
                    var status = self.validator(req[toValidate[keys[i]]], validate[keys[i]]);
                    if (status.error) {
                        return handleFailure(status);
                    }
                }
            }
        }

        if (validate.response) {
            var send = res.send;
            res.send = function(body) {
                var status = self.validator(body, validate.response);
                if (status.error) {
                    return handleFailure(status);
                }

                return send(status.body);
            }
        }

        next();
    }
}

module.exports = new Conformity();