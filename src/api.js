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
 * /session/user/{userId}:
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
 *       500:
 *         description: Internal Server Error
 */

router.get('/session/user/:userId', async (req, res) => {
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

/**
 * @swagger
 * /session/{sessionId}:
 *   get:
 *     description: Get a specific session by its ID
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
 *       500:
 *         description: Internal Server Error
 */
router.get('/session/:sessionId', async (req, res) => {
	try {
		const session = await Session.findById(req.params.sessionId)
		res.json(session)
	} catch (error) {
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
		await Session.findByIdAndDelete(req.params.sessionId)
		res.json({ message: 'Session deleted' })
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{userId}:
 *   post:
 *     description: Create a new session for a specified user with current date-time title
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: ID of the user for whom the session is to be created
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Session successfully created for the specified user
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             user:
 *               type: string
 *             title:
 *               type: string
 *             messages:
 *               type: array
 *               items:
 *                 type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *       500:
 *         description: Internal Server Error
 */
router.post('/session/:userId', async (req, res) => {
	try {
		console.log(req.params.userId)
		const session = new Session({
			user: req.params.userId,
			title: new Date().toLocaleString(),
			messages: [],
			createdAt: new Date(),
		})
		await session.save()
		res.json(session)
	} catch (error) {
		console.log(error)
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
		const session = await Session.findById(req.params.sessionId)
		messages = session.messages
		if (!req.body.content || !req.params.sessionId) {
			return res
				.status(400)
				.json({ error: 'Content and sessionId is required' })
		}

		messages.push(req.body.content)
		result = await openAIChat(messages)
		console.log(result)
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
		console.log(error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

/**
 * @swagger
 * /session/{sessionId}/{title}:
 *   put:
 *     description: Update the title of a specified session
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sessionId
 *         description: ID of the session to be updated
 *         in: path
 *         required: true
 *         type: string
 *       - name: title
 *         description: New title for the session
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Session title successfully updated
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             user:
 *               type: string
 *             title:
 *               type: string
 *             messages:
 *               type: array
 *               items:
 *                 type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *       500:
 *         description: Internal Server Error
 */
router.put('/session/:sessionId/:title', async (req, res) => {
	try {
		const session = await Session.findById(req.params.sessionId)
		session.title = req.params.title
		await session.save()
		res.json(session)
	} catch (error) {
		console.log(error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

module.exports = router
