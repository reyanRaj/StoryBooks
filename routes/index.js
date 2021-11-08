const express = require('express');
const router = express.Router()
const { ensureAuth , ensureGuest } = require('../middleware/auth');
const Story = require('../models/Story')
/* @desc Landing Page or Login */
/* @route GET / */
router.get('/',ensureGuest,(req,res) => {
	res.render('login',{layout: 'login'});
})


/* @desc Dash board */
/* @route GET /dashboard */
router.get('/dashboard',ensureAuth,async(req,res) => {
	try{
		const stories = await Story.find({user: req.user.id }).lean()
		res.render('dashboard', {
			name: req.user.displayName,
			stories
		});
	}catch(err){
		console.log(err)
		res.render('error/500')
	}
})


module.exports = router;