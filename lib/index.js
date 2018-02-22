var Joi = require('joi');
var Xss = require('xss');

function Conformity () {
    this.logger = console.log;
    this.validator = Joi;
    this.options = {};
    this.options.useXSS = true;
}

Conformity.prototype.handleFailure = function (req, res, next) {
    return function (status, callback) {
        var send = res.send.bind(res);
        if (res.prettyError) {
            send = res.prettyError;
        }
        var error = {
            name: status.error.name,
            details: status.error.details
        };
        return send(error, 500);
    }
}

Conformity.prototype.handleValid = function (value) {
    if (this.options.useXSS) {
        return Xss(value);
    }
    return value;
}

Conformity.prototype.handleValidObject = function (obj) {
    var keys = Object.keys();
    for(var i = 0; i<keys.length; i++) {
        var key = keys[i];
        if (typeof obj[key] == 'object') {
            obj[key] = this.handleValidObject(obj[key]);
        } else {
            obj[key] = this.handleValid(obj[key]);
        }
    }
    
    return obj;
}

Conformity.prototype.validate = function (){
    var self = this;

    return function (req, res, next) {
        var validate = {};
        try {
            validate = req.route.stack[req.route.stack.length - 1].handle.validate
        } catch (e) {
            console.log('Conformity.validate() unable to find route.stack:', e);
            return next();
        }

        if (validate) {
            var toValidate = {'query':'query', 'path':'params', 'payload': 'body'}
            var handleFailure = self.handleFailure(req, res, next);

            var keys = Object.keys(toValidate);
            var l = keys.length;
            for(var i = 0; i < l; i++) {
                if (validate[keys[i]]) {
                    var status = self.validator.validate(req[toValidate[keys[i]]], validate[keys[i]]);
                    // TODO: check if options disable overwrite
                    req[toValidate[keys[i]]] = status.value;

                    if (status.error) {
                        return handleFailure(status);
                    }
                }
            }
        }

        if (validate.response) {
            var send = res.send;
            res.send = function(body) {
                var status = self.validator.validate(body, validate.response);
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
module.exports.Conformity = Conformity;
module.exports.Joi = Joi;
