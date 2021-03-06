//Importing the dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const sql = require('mysql');
var cors = require('cors');
var feedback = require('./routes/feedback');
var assignment = require('./routes/assignment');
var newform = require('./routes/form');
var def = require('./routes/default');
var config =require('./routes/config');
var upload = require('./routes/uploads');
const jwt = require('jsonwebtoken');

const app = express();
//Initialising the basic token
app.use(cors());
var db_config = {
  host: 'localhost',
    user: 'root',
    password: 'notdefined',
    database: 'cbpgec'
    
};

app.set('secret',config.secret);
var con;

function handleDisconnect() {
  con = sql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log(err);                                  // server variable configures this)
    }
  });
}

handleDisconnect();
app.get('/test1', (req, res)=>{
	var stm = "Select * from log1;";
	con.query(stm, (err, result)=>{
		if (err) console.log(err);
		res.send(result)
	})
})



setInterval(function () {
    con.query('SELECT 1');
}, 5000);

var dateUTC = new Date();
var dateUTC = dateUTC.getTime() 
var today = new Date(dateUTC);


//date shifting for IST timezone (+5 hours and 30 minutes)
today.setHours(today.getHours() + 5); 
today.setMinutes(today.getMinutes() + 30);
console.log(today);

// // Catch all other routes and return the index file


// app.use(jsonFormat);

// function jsonFormat(req, res, next) {
// 	res.setHeader('Content-Type', 'application/json');
// 	next();
// }

//Global Variables for date

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
// app.use('/api', api);

var Bearer = 0;
app.post('/login', function (req, res, next) {
	var a1 = req.query.id;
	var a2 = req.query.pass;
	var a4 = JSON.parse(JSON.stringify(req.headers));
	if (a4.authorization == 'Basic cbpgec-a24-u26-n20-p21') {
		if(a1 == 0 || a1.length<5){
			var stmt = `select * from logindatat where Enrollment_No = '${a1}' && Password = '${a2}'`;
			con.query(stmt, function (err, result) {
			if (err) {
				console.log(err);
				res.send(JSON.stringify({ error: 'Invalid Credentials dvfd' }));
			}
			else {
				if (result.length == 0) { res.send(JSON.stringify({ 'error': 'Invalid Credentials' })); }
				else {
					var roll = result[0].Enrollment_No;					
					var name = result[0].Password;
					var email = result[0].Email;
					var username = result[0].Name;
					var semester = result[0].Semester;
					var stm = "select bear from bearer";
					con.query(stm, (err, res1) => {
						if (err) console.log(err);
						else {
							if (res1.length == 0) Bearer = 1;						
							else {
								var ln = res1.length - 1;
								Bearer = parseInt(res1[ln].bear) + 1;
							}
							// Bearer = func(Bearer, roll);
							const payload = {
								username,
								semester
							}	
							var token = jwt.sign(payload, app.get('secret'), {
								expiresIn: 86400 // expires in 24 hours
							  });
							  Bearer = func(token, roll);
							res.send(JSON.stringify({ token : token, access_token: token, department:null, name: username, id: roll, email: email, semester: semester}));			
							}
					});
				}
			}
		})
		}
		else	
		{var year = getYear(a1);
				var stmt = `select * from log${year} where Enrollment_No = '${a1}' && Password = '${a2}'`;
				con.query(stmt, function (err, result) {
					if (err) { 
						console.log(err);
						res.send(JSON.stringify({ error: 'Invalid Credentials dvfd' }));}
					else {
						if (result.length == 0) {
											if(year<4){
											var title1 = `log${year+1}`;
											var stm = `select * from ${title1} where Enrollment_No = '${a1}' && Password = '${a2}';`;
											con.query(stm, (err, result1)=>{
												if (err) console.log(err);
												else{
													if(!result1[0]){res.send(JSON.stringify({"messaege":"Invalid Credentials"}))}
														else{var roll = result1[0].Enrollment_No;
							var name = result1[0].Password;
							var email = result1[0].Email;
							var username = result1[0].Name;
							var semester = result1[0].Semester;
							var stm = "select bear from bearer";
							con.query(stm, (err, res1) => {
								if (err) console.log(err);
								else {
									if (res1.length == 0) {
										Bearer = 1;
									}
									else {
										var ln = res1.length - 1;
										Bearer = parseInt(res1[ln].bear) + 1;
									}
									// Bearer = func(Bearer, roll);
									const payload = {
										username,
										semester
									}	
									var token = jwt.sign(payload, app.get('secret'), {
										expiresIn: 86400 // expires in 24 hours
									  });
									  Bearer = func(token, roll);
									if(roll.length<=4)
									res.send(JSON.stringify({ access_token: token, department:null, name: username, id: roll, email: email, semester: semester}));
									else{
										var ver = roll.substring(7,9);
										if(ver==31)
									res.send(JSON.stringify({ access_token: token, department:'IT', name: username, id: roll, email: email, semester: semester}));
										else {
											res.send(JSON.stringify({ access_token: token, department:'civil', name: username, id: roll, email: email, semester: semester}));
										}
		
									}						
										}
								})}
												}
											})
										}
										else{res.send(JSON.stringify({"messaege":"Invalid Credentials"}))}

							 }
						else {
							var roll = result[0].Enrollment_No;
							var name = result[0].Password;
							var email = result[0].Email;
							var username = result[0].Name;
							var semester = result[0].Semester;
							var stm = "select bear from bearer";
							con.query(stm, (err, res1) => {
								if (err) console.log(err);
								else {
									if (res1.length == 0) {
										Bearer = 1;
									}
									else {
										var ln = res1.length - 1;
										Bearer = parseInt(res1[ln].bear) + 1;
									}
									
									const payload = {
										username,
										semester
									}	
									var token = jwt.sign(payload, app.get('secret'), {
										expiresIn: 86400 // expires in 24 hours
									  });
									  Bearer = func(token, roll);
								
									if(roll.length<=4)
									res.send(JSON.stringify({ access_token: token, department:null, name: username, id: roll, email: email, semester: semester}));
									else{
										var ver = roll.substring(7,9);
										if(ver==31)
									res.send(JSON.stringify({ access_token: token, department:'IT', name: username, id: roll, email: email, semester: semester}));
										else {
											res.send(JSON.stringify({ access_token: token, department:'civil', name: username, id: roll, email: email, semester: semester}));
										}
		
									}						
										}
								})
							
						}
					}
				})}
	}
	else {
		res.send(JSON.stringify({ msg: 'Access Denied' }));
	}

});
var getYear = function(id){
	var year = id.substring(9,11);
	var curYear = today.getYear();
	var current = (curYear.toString()).substring(1,3);
	var yearc = current-year;
	return yearc;
}

var func = (bearer, roll) => {
	var stmt1 = "INSERT into bearer (bear,roll) VALUES( '" + bearer + "' , '" + roll + "');";
	con.query(stmt1, function (err, result) {
		if (err) console.log(err);
		else console.log("Insertion successful");
	});
	return bearer;
}





var t
var assID;

// app.use(bearerCheck);
app.use('/feedback', feedback);
app.use('/assignment', assignment);
app.use('/newform', newform);
app.use(upload);


// //Insert form details
// app.post('/form/insert/student/:stdid', (req, res) => {
// 	var check = req.check;
// 	if (check) { res.send('Access Denied'); }
// 	else
// {
// 	var assData = req.body;
// 	insert('form', assData, res);	
// } 
// })
//Insert teacher details
// app.post('/form/insert/teacher', (req, res) => {
// 	var check = req.check;
// 	if (check) { res.send('Access Denied'); }
// 	else
// {
// 	var assData = req.body;
// 	insert('teacher', assData, res);	 
// }
// })




app.use(def);

app.get('*', (req, res) => {
	console.log("main");
	res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));

//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////GLOBAL FUNCTIONS///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////



var getYearFromSem = function(sem){
	if(sem==1 || sem==2) return 1;
	if(sem==3 || sem==4) return 2;
	if(sem==5 || sem==6) return 3;
	if(sem==7 || sem==8) return 4;
}



var deleteColumn = function(table, column, res){
	var stmt = `ALTER TABLE ${table} DROP ${column}`;
	con.query(stmt, (err, data) => {
		if (err) {console.log(err);
		res.send(JSON.stringify({"message":"Column Not Deleted Successfully"}));}
		else{
			res.send(JSON.stringify({"message":"Column Deleted Successfully"}));			
		}
	})
}

var addColumn = function(table, column, datatype, res){
	var stmt = `ALTER TABLE ${table} ADD ${column} ${datatype};`;
	con.query(stmt, (err, data) => {
		if (err) {console.log(err);
		res.send(JSON.stringify({"message":"Column Not Added Successfully"}));}
		else{
			res.send(JSON.stringify({"message":"Column Added Successfully"}));
		}
	})
}

var roll;

var maxId = function(loginData, res){
	var stm = `select MAX(teacherId) from teacher`;
		con.query(stm, (err, data)=>{
			if (err) {
			console.log(err);
			res.send(JSON.stringify({ msg: 'Fetching unsuccessful' }));
					 }
			else{
				roll = data[0]['MAX(teacherId)']+1;
				loginData['Enrollment_No'] = roll;
				insert('logindatat', loginData, res);
				res.send(JSON.stringify({ 'New Teacher Id': roll }));
			}
		})

}

var update = function (tableName, assData, row, id, res) {
	con.query(`UPDATE ${tableName} SET ? where ${row} = ${id};`, assData, (err, data) => {
		if (err) console.log(err);
		else {
			res.send(JSON.stringify({ msg: 'Update Successful' }));
		}
	})
}

//Insert Student solution into database

var insert = function (tableName, assData, res) {
	con.query(`INSERT INTO ${tableName} SET ?`, assData, function (err, result) {
		if (err) console.log(err);
		else {

		}
	});
}

var fetchpage = function (page, data, res) {

	var arr = [];
	var starting = (12 * page) - 12;
	var ending;
	if (data[12 * page]) {
		ending = 12 * page
	}
	else {
		ending = data.length;
	}
	for (var i = starting; i < ending; i++) {
		arr.push(data[i]);
	}
	res.send(arr);
}

var deleteData = function (tableName, row, tid) {
	console.log(row);
	var delstm = `delete from ${tableName} where ${row} = ${tid};`
	con.query(delstm, (err, data) => {
		if (err) console.log(err);
		else {

		}
	})
}

//function to fetch details from form
function fetchfromform(id, res, year) {
	var formstm3 = `select * from log${year} where Enrollment_No = ${id};`;
	con.query(formstm3, (err, data) => {
		if (err) console.log(err);
		else {
			var obj = {
				Enrollment_No: data[0].Enrollment_No,
				Name: data[0].Name,
				Email: data[0].Email,
				Semester: data[0].Semester,
				Father_Name: data[0].Father_Name,
				Mother_Name: data[0].Mother_Name,
				Student_Mobile: data[0].Student_Mobile,
				Father_Mobile: data[0].Father_Mobile,
				Father_Occupation: data[0].Father_Occupation,
				Mother_Occupation: data[0].Mother_Ocupation,
				Father_Office_Address: data[0].Father_Office_Address,
				Permanent_Address: data[0].Permanent_Address,
				Correspondence_Address: data[0].Correspondence_Address,
				Date_Of_Birth: data[0].Date_Of_Birth,
				Training_Details: data[0].Training_Details,
				Achievement_Details: data[0].Achievement_Details
			}
			res.send(obj);
		}
	})
}
//function to fetch details from logindata
function fetchfromlogin(id, res, year) {
	var formstm2 = `select * from log${year} where Enrollment_No = ${id};`;
	con.query(formstm2, (err, data) => {
		if (err) console.log(err);
		else {
			if (!data[0]) { res.send(JSON.stringify({'message' : "Student not found"})); }
			else {
				var obj = {
					Enrollment_No: data[0].Enrollment_No,
					Name: data[0].Name,
					Email: data[0].Email,
					Semester: data[0].Semester,
					Father_Name: '',
					Mother_Name: '',
					Student_Mobile: '',
					Father_Mobile: '',
					Father_Occupation: '',
					Mother_Occupation: '',
					Father_Office_Address: '',
					Permanent_Address: '',
					Correspondence_Address: '',
					Date_Of_Birth: '',
					Training_Details: '',
					Achievement_Details: ''
				}
				res.send(obj);
			}
		}
	})
}