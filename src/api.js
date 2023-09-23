const express = require('express')

const Session = require('./model/sessions')

const router = express.Router()

router.get('/sessions', async (req, res) => {
	try {
		// 只回傳 user, title, 和 createdAt 的部分
		const sessions = await Session.find({}, 'user title createdAt')
		res.json(sessions)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.get('/sessions/:userId', async (req, res) => {
	try {
		const sessions = await Session.find(
			{ user: req.params.userId },
			'user title createdAt'
		)
		res.json(sessions)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.get('/session/:sessionId', async (req, res) => {
	try {
		const session = await Session.findById(req.params.sessionId)
		res.json(session)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.delete('/session/:sessionId', async (req, res) => {
	try {
		await Session.findByIdAndDelete(req.params.sessionId)
		res.json({ message: 'Session deleted' })
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.post('/session', async (req, res) => {
	try {
		const session = new Session({
			user: req.body.user,
			title: req.body.title,
			messages: req.body.messages,
			createdAt: new Date(),
		})
		await session.save()
		res.json(session)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

//PUT /api/sessions/:sessionId/messages
router.put('/session/:sessionId/messages', async (req, res) => {
	try {
		const session = await Session.findById(req.params.sessionId)
		session.messages.push(req.body.content)
		await session.save()
		res.json(session)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

module.exports = router
