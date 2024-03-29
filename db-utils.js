const router = require('./shared').ROUTER;



const login = (req, res) => {

  userName = req.body.userName;
  email = req.body.email;
  password = req.body.password;
  var user;
  // login with userName/password
    if (userName){
       user = router.db.get('users').value().find(e => e.userName===userName)
      if (!user){
        res.status( 401 ).send( 'No registered user found with the given userName!\n' );
        return;
      } 
    }

    //login with email/password
    else if (email){
      user = router.db.get('users').value().find(e => e.userName===email)
      if (!user){
        res.status( 401 ).send( 'No registered user found with the given email!\n' );
        return;
      } 
    }

    if (user && user.password===password){
      res.jsonp({
                            auth_token: {
                                        _id: user.id,
                                        token: user.token,
                                        userName: user.userName,
                                        email: user.email,
                                        firstName: user.firstName,
                                        isEmailVerified: user.isEmailVerified,
                                        accountVerified: user.accountVerified,
                                        image: user.image,
                                        profileLanguage: user.profileLanguage,
                                        isAccountLocked: user.isAccountLocked
                                    }
                            }
                  )
      return;
    } else{
     res.status( 401 ).send( "Wrong Password!\n" )
    return
    }
}

const checkUserNameExists = (req, res) => {

    param = req.params?.userName
  
    if (!param){
      res.status( 500 ).send( "Wrong Query!" )
    }
    var db = router.db;
    var user = db.get('users').value().find(e => e.userName===param);
    if (user){
      res.jsonp({exists: true});
      return;
    } else {
      res.jsonp({exists: false});
      return;
    }
   
 }

const checkEmailExists = (req, res) => {

    param = req.params?.email
  
    if (!param){
      res.status( 500 ).send( "Wrong Query!" );
      return;
    }
    var db = router.db;
    var user = db.get("users").value().find(e => e.email===param);
    if (user){
      res.jsonp({exists: true});
      return;
    } else {
      res.jsonp({exists: false});
      return;
    }
}

const deleteToDoArea =  (req, res) => {

  param = req.params?.id

  if (!param){
    res.status( 500 ).send( "Wrong Query!" );
    return;
  }
  var db = router.db;
  var toDoAreaToBeDeleted = db.get('toDoAreas').value().find(e => e.id === +param);
  if (!toDoAreaToBeDeleted){
    throw new Error(
      `ToDoArea with id ${toDoAreaToBeDeleted.id} does not exist!`
  );
  }
  if (toDoAreaToBeDeleted){

    // resulted collection after delete
    var resCol = db.get('toDoAreas').value().filter(e => e.id !== +param)
    db.set('toDoAreas', resCol).write();
    
    /// Updates related ToDoTasks childs if any exists
    var relatedTasksCol = db.get('toDoTasks').value().filter(e => e.toDoAreaId===toDoAreaToBeDeleted.id);
    relatedTasksCol.forEach(relatedTaskElement => {
      relatedTaskElement.toDoAreaId = "";
    });
    db.update('toDoTasks', relatedTasksCol).write();


    return res.jsonp(toDoAreaToBeDeleted);
  } else {
    return;
  }
}

const deleteToDoTask =  (req, res) => {

  param = req.params?.id

  if (!param){
    res.status( 500 ).send( "Wrong Query!" );
    return;
  }
  var db = router.db;
  var toDoTaskToBeDeleted = db.get('toDoTasks').valueOf().find(e => e.id === +param);
  if (!toDoTaskToBeDeleted){
    throw new Error(
      `ToDoTask with id ${toDoTaskToBeDeleted.id} does not exist!`
  );
  }
  if (toDoTaskToBeDeleted){

    // resulted collection after delete
    var resultedCol = db.get('toDoTasks').valueOf().filter(e => e.id !== +param)
    db.set('toDoTasks', resultedCol).write();
    return res.jsonp(toDoTaskToBeDeleted);
  } else {
    return;
  }
}

const refreshToken = (req, res) => {
 return res.status(461).send("Wrong Password!");
}

const resetPassword = (req, res) => {
  return res.status(461).send("This feature is not implemented!");
 }
 

const verifyAccount = (req, res) => {
}

const logout = (req, res) => {
  return res.status(200).send({err: "You signed out!"});
}

module.exports = {
  login,
  checkUserNameExists,
  checkEmailExists,
  refreshToken,
  resetPassword,
  verifyAccount,
  logout,
  deleteToDoArea,
  deleteToDoTask
}