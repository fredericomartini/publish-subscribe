const express = require('express');

/** @summary Routes */
const emailRoute = require('./email');
const smsRoute = require('./sms');
const pushRoute = require('./push');

const router = express.Router({
  mergeParams: true
});

router.use('/email', emailRoute);
router.use('/sms', smsRoute);
router.use('/push', pushRoute);

/** @summary Instantiate routes */
router.use('/', (req, res) => {
  res.send('ok');
});

module.exports = router;
