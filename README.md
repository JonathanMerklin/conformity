# Conformity - HTTP Parameter Validation Middleware

[![Dependency Status](https://david-dm.org/thegoleffect/conformity.svg)](https://david-dm.org/thegoleffect/conformity.svg)
[![devDependency Status](https://david-dm.org/thegoleffect/conformity/dev-status.svg)](https://david-dm.org/thegoleffect/conformity/dev-status.svg)

Conformity is a JSON validation middleware for express.js. It lets you perform path, query, payload, and response validation without polluting your handler code. Additionally, it performs XSS html escaping automatically.

## Getting Started

```
npm install --save conformity
```


```
var Express = require('express');
var Conformity = require('conformity');
var Joi = Conformity.validator;

var app = Express();

// CONFORMITY USAGE:
app.use(Conformity.validate());
var IndexHandler = function (req, res) {
    return 'Hello! ' + req.params.name;
}
IndexHandler.validate = {
    path: {
        name: Joi.string().required()
    }
};

app.get('/:name', IndexHandler);

app.listen(3000);
```