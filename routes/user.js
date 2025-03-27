const express=require('express')
const router=express.Router();

const userController=require('../controllers/user')

router.get('/',userController.getStandings);

router.get('/teams',userController.getTeams);

router.get('/matches',userController.getMatches);

router.get('/stats',userController.getStats);

router.get('/teams/view/:name',userController.getViewTeam);

module.exports=router;