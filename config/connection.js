const express = require('express');
const mongoose = require('mongoose');
const url = 'mongodb://johnkingsley917@gmail.com:johnkingsley917@gmail.com@ds213183.mlab.com:13183/hbflempire';

const conn = mongoose.connect(url, function (err, db) {
	if (err) {
		console.log('error');
	} else {
		console.log('connected');
	}
});

module.exports = conn