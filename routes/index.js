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
const UssdBuilder = require('ussd-menu-bulder');
const axios = require('axios');
const session = require('./utils/session');

let menu = new UssdMenu();

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
		menu.con('Please provide your email address:');
	},
	next: {
		'*^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$':'registerUser.end'
	}
});

// Show final message to user on registration thread
menu.state('registerUser.end', {
	run: () => {
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
		.then((response)=>{
			console.log(response.content)
			// response.content
			// response.originator.name
		})		
		.catch((error)=>{
			console.log(error)
		});
	},
	next: {

	}
});

// Get user feedback
menu.state('feedback', {
	run: () => {
		menu.con('On a scale of 1 to 5 (5 being awesome), how would you rate this session:\n');
	},
	next: {
		'*^\s*[a-zA-Z,\s]+\s*$':'feedback.end'
	}
});

// Final message to be shown
menu.state('feedback.end', {
	run: () => {
		menu.end('We are always trying to improve the Masterclass experience. Thank you for providing feedback.');
	}
});





// Ignore and delete this code when you're done

menu.state('showBalance', {
	run: () => {
		fetchBalance(menu.args.phoneNumber).then(bal => {
			menu.end('Your balance is ' + bal)
		});
	}
});

menu.state('buyAirtime', {
	run: () => {
		menu.con('Enter amount: ');
	},
	next: {
		'*//d+':'buyAirtime.amount'
	}
});

menu.state('buyAirtime.amount', {
	run: () => {
		buyAirtime(menu.args.phoneNumber, amount).then(res => {
			menu.end('Airtime bought successfully');
		});
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/ussd', (req, res, next) => {
	res.send(UssdBuilder)
});

module.exports = router;
