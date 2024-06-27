const express = require('express');
const router = require('express').Router();
const { getCurrentUser, updateCurrentUser } = require('../controllers/user');

// router.get('/', getUsers);
// router.get('/:userId', getUser);
// router.post('/', createUser);

router.get('/users/me', getCurrentUser);
router.patch('/users/me', updateCurrentUser)
module.exports = router;