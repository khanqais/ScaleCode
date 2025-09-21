const express = require('express')
const {
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem
} = require('../controllers/problemController.js')
const { requireAuth } = require('../auth/middle.js')

const router = express.Router()

// Apply auth middleware to all routes
router.use(requireAuth)

router.route('/')
  .post(createProblem)
  .get(getProblems)

router.route('/:id')
  .get(getProblem)
  .put(updateProblem)
  .delete(deleteProblem)

module.exports = router
