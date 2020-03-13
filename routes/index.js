/*

==========================================
This runs the core USSD application.
Feel free to make changes where necessary

Written by Anthony Kiplimo, 2020
==========================================
*/

// Imports
const express = require('express');
const router = express.Router();
const UssdMenu = require('ussd-menu-builder');
const axios = require('axios');

let sessions = {};
let menu = new UssdMenu();

menu.sessionConfig({
	start: (sessionId, callback) => {
		//initialize session if session does not exist
		//this is called by menu.run()
		if(!(sessionId in sessions)) sessions[sessionId] = {};
		//callback();
	},
	end: (sessionId, callback) => {
		delete sessions[sessionId];
		//callback()
	},
	set: (sessionId, key, value, callback) => {
		sessions[sessionId][key] = value;
		//calback()
	},
	get: (sessionId, key, callback) => {
		//retrive value from current session
		let value = sessions[sessionId][key];
		//callback(null, value);
	}
});

/*

==========
START MENU
==========

Welcome to the AT Registration USSD. Please choose an option to continue:

1. Register for the AT Conversational APIs
2. Try my luck
3. Give feedback on the session

====================================
1. GET USER NAME (FIRST & LAST) ~> 1
====================================

Please provide your first name and last name:

==================================================
GET USER EMAIL ADDRESS ~> 1 * <Firstname Lastname>
==================================================

Please provide your email address:

==========================
SUCCESS MESSAGE + Send SMS
==========================

[END] Thank you for registering for the Africa's Talking Conversational API Beta.
We will reach out to you with more details.

===================
2. GET A QUOTES API
===================

[END] <INSERT RANDOM QUOTE>

===============================
3. GIVE FEEDBACK ON THE SESSION
===============================

On a scale of 1 to 5 (5 being awesome), how would you rate this session:

=============
FINAL MESSAGE
=============

We are always trying to improve the Masterclass experience. Thank you for providing feedback. 

*/


/*

We can make sure that we check if the user has used the USSD and return the appropriate menu

Idealy, we can show an END menu with "User already registered messsage" but this is dependent
on the type of application that you're building.

PS: We could aso store the string responses as Objects and calling specific configurations
and displaying them. This provides better breakdown of code and file sizes are much less.

>> Only use what you need

*/


// Initial state
menu.startState({
	run: () => {
		menu.con('Welcome to the AT Registration USSD. Please choose an option to continer:' +
			'\n1. Register for the AT Conversational APIs' +
			'\n2. A random message' +
			'\n3. Give feedback on the session');
	},
	next: {
		'1':'registerUser',
		'2':'randomMessage',
		'3':'feedback'
	}
});

// Get user first name and last name
menu.state('registerUser', {
	run: () => {
		menu.con('Please provide your first name and last name:\n');
	},
	next: {
		'*[a-zA-Z]+':'registerUser.fullName'
	}
});

// Get user email address
menu.state('registerUser.fullName', {
	run: () => {
		//save user to firebase
		let fullName = fullName;
		menu.session.set('fullName', fullName, err => {
			menu.go('registerUser');
		});
		menu.con('Please provide your email address:');
	},
	next: {
		'*^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$':'registerUser.emailAddress'
	}
});

// Show final message to user on registration thread
menu.state('registerUser.emailAddress', {
	run: () => {
		let emailAddress = emailAddress;
		menu.session.set('emailAddress', emailAddress, err => {
			menu.go('registerUser.fullName');
		});
		menu.end('Thank you for registering for the Africas Talking Conversational API Beta .We will reach out to you with more details.');
	}
});

// Generate and show random quote to user
menu.state('randomMessage', {
	run: () => {
		axios({
			"method":"GET",
			"url":"https://quotes15.p.rapidapi.com/quotes/random/",
			"headers":{
			"content-type":"application/octet-stream",
			"x-rapidapi-host":"quotes15.p.rapidapi.com",
			"x-rapidapi-key":"0c72ea80c1mshfadaa497a882118p117e53jsnbc70c9cc932e"
			},"params":{
			"language_code":"en"
			}
			})
		.then((resp)=>{
			console.log(resp.content)
			// response.content
			// response.originator.name
			menu.end(resp.content + '\n' + resp.originator.name);
		})		
		.catch((error)=>{
			console.log(error)
			menu.go('Something went wrong, please try again later.');
		});
	}
});

// Get user feedback
menu.state('feedback', {
	run: () => {
		menu.con('On a scale of 1 to 5 (5 being awesome), how would you rate this session:\n');
	},
	next: {
		'*^\s*[a-zA-Z,\s]+\s*$':'feedback.feedbackMessage'
	}
});

// Final message to be shown
menu.state('feedback.feedbackMessage', {
	run: () => {
		let feedbackMessage = feedbackMessage;
		menu.session.set('feedbackMesssage', feedbackMessage, err => {
			console.log(err);
			menu.go('feedback');
		});
		menu.end('We are always trying to improve the Masterclass experience. Thank you for providing feedback.');
		//save to db (Firebase) all the data from the session for this particular flow ~> Feedback Flow 
	}
});




/*

=================
END OF USSD LOGIC
=================

*/


/*

======
ROUTES
======

*/

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*

===================
SETTING UP THE USSD
===================

*/

router.post('/ussd', function(req, res) {
	menu.run(req.body, ussdResult => {
		res.send(ussdResult);
	});
});

module.exports = router;
