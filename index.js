const { v4: uuidv4 } = require('uuid');
const dbUtils = require('./db-utils');
// const JSON_SERVER = require("json-server");
// const ROUTER = JSON_SERVER.router('./db/db.json');
const tokenGen = require('./shared').generateToken;
const JSON_SERVER = require("./shared").JSON_SERVER;
const ROUTER = require("./shared").ROUTER;
const SERVER = JSON_SERVER.create();
const MIDDLEWARES  = JSON_SERVER.defaults();
const ROUTES = require ('./routes/routes.json')

// Set default middlewares (logger, static, cors and no-cache)
SERVER.use( MIDDLEWARES );

// To handle POST, PUT and PATCH you need to use a body-parser
SERVER.use(JSON_SERVER.bodyParser);

// authorization middleware: you can add custom api authorisation logic
// for the sake of this example, there will be no api authorization.=> accept any request
// It could be mire wise to secure your apis though ;) 
SERVER.use( function ( req, res, next ) {
  if ( 1==1 ) {
    next();
  } else {
    res.status( 401 ).send( "Unauthorized!" )
  }
} );

// Custom middleware to access different http methods and deal with specific user design requirment.
SERVER.use((req, res, next) => {
  const body = req.body;
  if (req.method === "POST") {

    if (req.url === '/auth/register'){/// registering a new user ==> add autogenerated id to the entity
      body.id = uuidv4();
      body.token = tokenGen();
      body._id = body.id;

      // Pre-validate the user
      body.isEmailVerified = true;
      body.accountVerified = true;
      body.isAccountLocked = false;
      // If the method is a POST echo back the name from request body
      req.body = body;
      next();
      return
    }
    if (req.url === '/api/todotasks'){/// intercept todotask creation and add mandatory field toDoAreaId
      body.toDoAreaId = ""; // force parentID to "" in order to fix json-server embed queries with OneToMany relationships issue 
      req.body = body;
      next();
      return
    }
    next();
  } else if (req.method === "GET") {
    if (req.url.startsWith('/uapi/users/?filter')){/// retrieving current logged user information
      var userName = JSON.parse(req.query.filter).userName.$eq
      var user = ROUTER.db.get('users').value().find(e=>e.userName===userName);
      if (user){
        // this should comply with what is implemented in averos framework which could change in future releases
        // the object should be of type: {{returnedEntities: [user]}}
        res.jsonp({returnedEntities: [user]});
        // res.status(200).json(user)
        return;
      }
    }
    next();
  } 
  else if (req.method === "PUT") {
      // Transforming all PUT Method to PATCH methods in order to force using PATCH instead of PUT when updating entities
      req.method = 'PATCH';
      
      // Removed technical members 
      if (req.body?.entityViewLayout){
        req.body.entityViewLayout = undefined;
      }
      if (req.body?.entityViewLayout$){
        req.body.entityViewLayout$ = undefined;
      }
      if (req.body?.instanceMetadata){
        req.body.instanceMetadata$ = undefined;
      }
      
      next();
  }
//   else if (req.method === "DELETE") {
//     if (req.url.includes('/api/todoareas')){/// intercept todoarea deletion in order to prevent json-server cascade deletion resulting on the deletion of all
//       dbUtils.deleteToDoArea(req, res);
//       return
//     }
//     next();
// }     
  else {
      //Let db.json handle the request
      next();
  }  
});

SERVER.get('/auth/users/email/:email', (req, res) => dbUtils.checkEmailExists(req, res));
SERVER.get('/auth/users/:userName', (req, res) => dbUtils.checkUserNameExists(req, res));
SERVER.post('/auth/login', (req, res) => dbUtils.login(req, res));

// Refresh Token
SERVER.post('/auth/rt', (req, res) => dbUtils.refreshToken(req, res));

SERVER.post('/auth/rrp', (req, res) => dbUtils.resetPassword(req, res));
// Verify Account
SERVER.post('/auth/vaccount', (req, res) => dbUtils.verifyAccount(req, res));

// Logout 
SERVER.post('/auth/logout', (req, res) => dbUtils.logout(req, res));

/// handle the special deletion case: json-server bug https://github.com/typicode/json-server/pull/756
SERVER.delete('/api/todoareas/:id', (req, res) => dbUtils.deleteToDoArea(req, res));
SERVER.delete('/api/todotasks/:id', (req, res) => dbUtils.deleteToDoTask(req, res));

// use custom route configuration (/routes/routes.json)
SERVER.use(JSON_SERVER.rewriter(ROUTES));

// default json-server routers
SERVER.use( ROUTER );
SERVER.listen( 3333, () => {
  console.log( 'Averos Backend Server Mock is running on : http://localhost:3333' );
} );