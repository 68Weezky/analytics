const express = require("express");
const adminController = require("../controllers/admin");
const teamController = require("../controllers/team");
const router = express.Router();

router.get('/register',adminController.getRegister);

router.post('/register',adminController.postRegister);

router.get('/',adminController.authenticate,adminController.getIndex);

router.get('/',adminController.getLogin);

router.post('/',adminController.postLogin);

router.get('/addUser',/*adminController.authenticate,*/ adminController.getAddUser);

router.post('/addUser',/*adminController.authenticate,*/ adminController.postAddUser);

router.post('/handleRequests',adminController.postHandleRequests);


router.post('/addTeam',/*adminController.authenticate,*/adminController.postAddTeam);

router.get('/viewTeam',/*adminController.authenticate,*/teamController.getViewTeam);

router.post('/addPlayer',teamController.postAddPlayer);

router.post('/newSeason',adminController.postNewSeason);

router.post('/setMatch',adminController.postSetMatch);

router.get('/squad/:matchNo/:matchTeam',teamController.getSquad);

router.post('/squad',teamController.postSquad); 

router.get('/match/:matchNo/play',adminController.getMatch);

router.get('/match/:matchNo',adminController.getPreMatch);

router.post('/matchRes/:matchNo',adminController.postMatch);

router.get('/matchRes/:matchNo',adminController.getMatchRes);


router.get('/delPlayer/:playerSerial',teamController.getDelPlayer);

router.get('/Logout',adminController.getLogout);

router.get('/:playerSerial',teamController.getViewPlayer);

module.exports= router;
