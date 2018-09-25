const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const register = require('../models/register');
const contact = require('../models/contact');
const enquiries = require('../models/enquiries');
const votestorage = require('../models/votestorage');

router.use(bodyparser.urlencoded({extended: true}));

router.use(express.static("public"));
router.use(express.static("public/images"));

//initializing session
router.use(session({
	secret: 'HbflEmpire',
	saveUnitialized: true,
	resave: false
}));

const storage = multer.diskStorage({
	destination: './public/images/',
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({
	storage: storage,
	limits: {fileSize: 100000},
	fileFilter: function (req, file, cb) {
		checkfile (file, cb);
	}
}).single('image');

//checking file type
function checkfile(file, cb) {
	//allowed extension
	const extType = /jpeg|jpg|png/;

	//checking ext
	const extname = extType.test(path.extname(file.originalname));

	// check mime
	const mimetype = extType.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true)
	} else {
		cb('Error: Images only');
	}
}

//routing for picture upload
router.post('/change_profile_picture', function (req, res) {
	if (req.session && req.session.email) {
		upload(req, res, function (err) {
			if (!err) {
				detail = req.file.filename,
				detail1 = "public/images\\" + req.file.filename
				register.findOneAndUpdate({email: req.session.email}, {$set: {filename: detail, pathname: detail1}}, function (err, result) {
					if (result) {
						res.render('welcome', {
							img: result.filename
						});
					} else {
						console.log('error');
					}
				});
			}
		});
	} else {
		res.render('signup');
	}
});

//routing for home page
router.get('/', function (req, res) {
	res.render('index');
});

//routing for about page
router.get('/about', function (req, res) {
	res.render('about');
});

//routing for blog page
router.get('/blog', function (req, res) {
	res.render('blog');
});

//routing for contact page
router.get('/contact', function (req, res) {
	res.render('contact');
});

//routing for posting messages from contact page
router.post('/contact', function (req, res) {
	details = contact(req.body);
	details.save(function (err, result) {
		if (result) {
			res.render('contact', {

				msg: 'Your Message Has Been Submitted Successfully, We will get across to you as soon as possible.'
			});
		} else {
			console.log('error');
		}
	});
});

//routing for signUp page
router.get('/signup', function (req, res) {
	res.render('signup');
});

//routing for contestant page
router.get('/contestant', function (req, res) {
	res.render('contestant');
});


//posting registration details to mongoDB database
router.post('/register', function (req, res) {
	//hashing the inputed password...
	bcrypt.hash(req.body.password, 15, function (err, hash) {
		if (err) {
			console.log('error');
		} else {
			user = "user",
			details = register({
				name: req.body.name,
				email: req.body.email,
				password: hash,
				confpassword: hash,
				check: req.body.checkbox,
				type: user
			});
			// saving all informations above to the database...
			details.save(function (err, result) {
				if (!err) {
					res.render('signup', {
						msg: "You Have Successfully Regsitered Your Account. Kindly Visit Your Email To Activate Your Account."
					});
				} else {
					console.log('error');
				}
			});
		}
	});
});

//Routing for login details of each users
router.post('/login', function (req, res) {
	req.session.email = req.body.email,
	req.session.password = req.body.password,
	req.session.type = req.body.type
	register.findOne({email: req.session.email, type: req.session.type}, function (err, result) {
		if (result) {
			name = result.name,
			email = result.email,
			bcrypt.compare(req.session.password, result.password, function (err, result) {
				if (result) {
					res.render('voting_rules');
				} else {
					res.render('signup',{
						error: "Incorrect username and Password combination"
					});
				}
			});
		} else {
			console.log('error');
		}
		
	});
});

router.get('/view_profile', function (req, res) {
	if (req.session && req.session.email) {
		register.find({email: req.session.email}, function (err, result) {
			if (result) {
				result.forEach(function (results) {
					res.render('welcome', {
					telephone: results.telephone,
					location:  results.location,
					fav_show:  results.fav_show,
					fav_housemate: results.fav_housemate,
					img: results.filename
				});
				});
			} else {
				console.log('error');
			}
		});
	} else {
		res.render('signup');
	}
});

router.get('/edit_profile', function (req, res) {
	if (req.session && req.session.email) {
		register.find({email: req.session.email}, function (err, result) {
			if (result) {
				result.forEach(function (results) {
					res.render('edit_profile', {
					img: results.filename
				});
				});
			} else {
				console.log('error');
			}
		});
	} else {
		console.log('error');
	}
	
});

router.post('/edit_profile', function (req, res) {
	register.findOneAndUpdate({email: req.session.email}, {$set: {location: req.body.location, telephone: req.body.telephone, fav_show: req.body.fav_show, fav_housemate: req.body.fav_housemate}}, function (err, result) {
		if (!err) {
			res.render('edit_profile', {
				msg: 'Your Profile Has Been Updated Successfully...'
			});
		} else {
			console.log('error');
		}
	});
});

router.get('/voting_rules', function (req, res) {
	if (req.session && req.session.email) {
		register.find({email: req.session.email}, function (err, result) {
			if (result) {
				result.forEach(function (results) {
					res.render('voting_rules', {
					img: results.filename
				});
				});
			} else {
				console.log('error');
			}
		});
	} else {
		res.render('signup');
	}
});

router.get('/complain_enquiries', function (req, res) {
	if (req.session && req.session.email) {
		register.find({email: req.session.email}, function (err, result) {
			if (result) {
				result.forEach(function (results) {
					res.render('complain_enquiries', {
					img: results.filename
				});
				});
			} else {
				console.log('error');
			}
		});
	} else {
		res.render('signUp');
	}
});

router.get('/view_contestants', function (req, res) {
	if (req.session && req.session.email) {
		register.find({email: req.session.email}, function (err, result) {
			if (result) {
				result.forEach(function (results) {
					res.render('hbflHousemates', {
					img: results.filename
				});
				});
			} else {
				console.log('error');
			}
		});
	} else {
		res.render('signup');
	}
});

//routing for posting users complain and enquiries
router.post('/complain_enquiries', function (req, res) {
	details = enquiries(req.body);
	details.save(function (err, result) {
		if (result) {
			res.render('complain_enquiries', {

				msg: 'Your Message Has Been Submitted To The Admin For Review, We will get across to you as soon as possible.'
			});
		} else {
			console.log('error');
		}
	});
});

//routing for password reset
router.post('/password_reset', function (req, res) {
	var password = req.body.password
	bcrypt.hash(password, 15, function (err, hash) {
		if (!err) {
			register.findOneAndUpdate({email: req.session.email}, {$set: {password: hash, confpassword: hash}}, function (err, result) {
				if (result) {
					message= "Your Password Has Been Updated Successfully";
					register.find({email: req.session.email}, function (err, result) {
				if (result) {
				result.forEach(function (results) {
					res.render('welcome', {
					telephone: results.telephone,
					location:  results.location,
					fav_show:  results.fav_show,
					fav_housemate: results.fav_housemate,
					message: message
				});
				});
			} else {
				console.log('error');
			}
		});
				} else {
					console.log('error');
				}
			});
		}
	});
});

//voting link for contestants
router.post('/vote_hbfl_contestant_martins', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_ewatomi', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_olawunmi', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_mitchell', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_fabulous', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_nancy', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_nichole', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_tessy', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_uche', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_adaobi', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_blessing', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.post('/vote_hbfl_contestant_starlet', function (req, res) {
	if (req.session && req.session.email) {
				details = votestorage({
					name: req.session.name,
					email: req.session.email,
					contestant: req.url
				});
				details.save(function (err, result) {
					votestorage.find({contestant: req.url}, function (err, result) {
						if (result.length > 1) {
							res.render('hbflHousemates', {
								msg: "You have voted for this contestant before, You are ineligible to Vote Twice!!!"
							});
						} else {
								res.render('hbflHousemates', {
									msg: "You have Successfully Voted For This contestant"
								});
						}
					});
		});
	} else {
		res.render('signup');
	}
});

router.get('/logout', function (req, res) {
	req.session.destroy();
	res.render('index');
});


module.exports = router;