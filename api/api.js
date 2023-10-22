const express = require('express')

const Session = require('./model/sessions')
const openAIChat = require('./utils/openai')

const router = express.Router()

/**
 * @swagger
 * definitions:
 *   Session:
 *     properties:
 *       user:
 *         type: string
 *       title:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: date-time
 *       messages:
 *         type: array
 *         items:
 *           type: string
 */

/**
 * @swagger
 * /session:
 *   get:
 *     description: Returns sessions with selected fields
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Session'
 *       500:
 *         description: Internal Server Error
 */
router.get('/session', async (req, res) => {
	try {
		// 只回傳 user, title, 和 createdAt 的部分
		const sessions = await Session.find({}, 'user title createdAt')
		res.json(sessions)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /users/{userId}/sessions:
 *   get:
 *     description: Get sessions based on a specific user ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns sessions associated with the provided user ID.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Session'
 *       400:
 *         description: Bad Request. User ID is required.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 */

router.get('/users/:userId/sessions', async (req, res) => {
	try {
		if (!req.params.userId) {
			return res.status(400).json({ error: 'User ID is required' })
		}

		const sessions = await Session.find(
			{ user: req.params.userId },
			'user title createdAt'
		)

		res.json(sessions)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{sessionId}:
 *   get:
 *     description: Get a session based on a specific session ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sessionId
 *         description: Session's ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the session associated with the provided session ID.
 *         schema:
 *           $ref: '#/definitions/Session'
 *       400:
 *         description: Bad Request. Session ID is required.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       404:
 *         description: Not Found. Session not found.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 */
router.get('/session/:sessionId', async (req, res) => {
	try {
		if (!req.params.sessionId) {
			return res.status(400).json({ error: 'Session ID is required' })
		}
		const session = await Session.findById(req.params.sessionId)
		res.json(session)
	} catch (error) {
		if (error.name === 'CastError') {
			return res.status(404).json({ error: 'Session not found' })
		}
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{sessionId}:
 *   delete:
 *     description: Delete a specific session by its ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sessionId
 *         description: Session's ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Session successfully deleted
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               default: "Session deleted"
 *       500:
 *         description: Internal Server Error
 */
router.delete('/session/:sessionId', async (req, res) => {
	try {
		if (!req.params.sessionId) {
			return res.status(400).json({ error: 'Session ID is required' })
		}

		const deletedSession = await Session.findByIdAndDelete(
			req.params.sessionId
		)

		res.json({ message: 'Session deleted' })
	} catch (error) {
		if (error.name === 'CastError') {
			return res.status(404).json({ error: 'Session not found' })
		}
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /users/{userId}/sessions:
 *   post:
 *     description: Create a new session for a specific user ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Successful operation. Returns the created session.
 *         schema:
 *           $ref: '#/definitions/Session'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 */

router.post('/users/:userId/sessions', async (req, res) => {
	try {
		const session = new Session({
			user: req.params.userId,
			title: new Date().toLocaleString(),
			messages: [],
			createdAt: new Date(),
		})
		await session.save()
		res.json(session)
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{sessionId}/messages:
 *   put:
 *     description: Add a message to a specific session
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sessionId
 *         description: Session's unique ID
 *         in: path
 *         required: true
 *         type: string
 *       - name: content
 *         description: Content of the message
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - content
 *           properties:
 *             content:
 *               type: string
 *     responses:
 *       200:
 *         description: Message successfully added and returns the updated session
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             user:
 *               type: string
 *             title:
 *               type: string
 *             messages:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request, content or sessionId missing
 *       500:
 *         description: Internal Server Error
 */
router.put('/session/:sessionId/messages', async (req, res) => {
	try {
		if (!req.body.content || !req.params.sessionId) {
			return res
				.status(400)
				.json({ error: 'Content and sessionId is required' })
		}

		const session = await Session.findById(req.params.sessionId)

		messages = session.messages

		messages.push(req.body.content)
		result = await openAIChat(messages)
		if (result) {
			session.messages.push(result.message.content)
			await session.save()
			res.json(session)
		} else {
			session.messages.push("Sorry, I don't understand.")
			await session.save()
			res.json(session)
		}
	} catch (error) {
		if (error.name === 'CastError') {
			return res.status(404).json({ error: 'Session not found' })
		}
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{sessionId}:
 *   put:
 *     description: Update the title of a session based on a specific session ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sessionId
 *         description: Session's ID
 *         in: path
 *         required: true
 *         type: string
 *       - name: title
 *         description: New title for the session
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the updated session.
 *         schema:
 *           $ref: '#/definitions/Session'
 *       400:
 *         description: Bad Request. Session ID and title are required.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       404:
 *         description: Not Found. Session not found.
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 */

router.put('/session/:sessionId', async (req, res) => {
	try {
		if (!req.params.sessionId || !req.query.title) {
			return res
				.status(400)
				.json({ error: 'Session ID and title is required' })
		}

		const session = await Session.findById(req.params.sessionId)

		session.title = req.query.title
		await session.save()
		res.json(session)
	} catch (error) {
		// catch error if session is not found
		if (error.name === 'CastError') {
			return res.status(404).json({ error: 'Session not found' })
		}

		res.status(500).json({ error: 'Internal Server Error' })
	}
})

module.exports = router
