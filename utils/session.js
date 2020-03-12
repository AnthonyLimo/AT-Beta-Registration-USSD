const express = require('express');
const router = express.Router();

router.get(':variable?', (req, res, next) => {
    //remeber to change variable to session
    let variable = req.params.variable;
    let session = req.session;

    if(variable && session['variable']) {
        //do something here
    } else {
        //do something else here
    }
});

module.exports = router;