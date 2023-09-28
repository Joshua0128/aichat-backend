const axios = require('axios')
const chai = require('chai')
const expect = chai.expect

describe('API Tests', function () {
	const baseURL = 'http://localhost:3000'

	const userId = 'testUser'
	let sessionId = ''

	describe('POST /users/:userId/sessions', function () {
		it('Should successfully create a session', async function () {
			const response = await axios.post(
				`${baseURL}/users/${userId}/sessions`
			)
			expect(response.status).to.equal(200)
			expect(response.data).to.include.keys(
				'_id',
				'user',
				'title',
				'messages',
				'createdAt'
			)
			sessionId = response.data._id
		})
	})

	describe('GET /users/:userId/sessions', function () {
		it('Should successfully retrieve sessions', async function () {
			const response = await axios.get(
				`${baseURL}/users/${userId}/sessions`
			)
			expect(response.status).to.equal(200)
			expect(response.data).to.be.an('array')
			expect(response.data[0]).to.have.keys(
				'_id',
				'user',
				'title',
				'createdAt'
			)
		})
	})

	describe('GET /session/:sessionId', function () {
		it('Should successfully retrieve a session', async function () {
			const response = await axios.get(`${baseURL}/session/${sessionId}`)
			expect(response.status).to.equal(200)
			expect(response.data).to.include.keys(
				'_id',
				'user',
				'title',
				'messages',
				'createdAt'
			)
		})

		it('Should return 400 if session ID is not provided', async function () {
			try {
				await axios.get(`${baseURL}/session/`)
			} catch (error) {
				expect(error.response.status).to.equal(400)
				expect(error.response.data.error).to.equal(
					'Session ID is required'
				)
			}
		})

		it('Should return 404 if session is not found', async function () {
			const nonExistentSessionId = 'nonExistentId'
			try {
				await axios.get(`${baseURL}/session/${nonExistentSessionId}`)
			} catch (error) {
				expect(error.response.status).to.equal(404)
				expect(error.response.data.error).to.equal('Session not found')
			}
		})
	})

	describe('PUT /session/:sessionId?title', function () {
		it('Should successfully update the title of a session', async function () {
			const newTitle = 'updatedTitle'
			const response = await axios.put(
				`${baseURL}/session/${sessionId}?title=${newTitle}`
			)
			expect(response.status).to.equal(200)
			expect(response.data).to.include.keys(
				'_id',
				'user',
				'title',
				'messages',
				'createdAt'
			)
			expect(response.data.title).to.equal(newTitle)
		})

		it('Should return 400 if session ID or title is not provided', async function () {
			// Scenario: Missing title
			try {
				await axios.put(`${baseURL}/session/:sessionId?title=`)
			} catch (error) {
				expect(error.response.status).to.equal(400)
				expect(error.response.data.error).to.equal(
					'Session ID and title is required'
				)
			}
		})

		it('Should return 404 if session is not found', async function () {
			const nonExistentSessionId = 'nonExistentIdForUpdate'
			const newTitle = 'someTitle'
			try {
				await axios.put(
					`${baseURL}/session/${nonExistentSessionId}?title=${newTitle}`
				)
			} catch (error) {
				expect(error.response.status).to.equal(404)
				expect(error.response.data.error).to.equal('Session not found')
			}
		})
	})

	describe('PUT /session/:sessionId/messages', function () {
		it('Should successfully add a message with OpenAI chat result', async function () {
			this.timeout(10000)
			const messageContent = {
				content: 'hi, reply me in 3 words.',
			}
			const response = await axios.put(
				`${baseURL}/session/${sessionId}/messages`,
				messageContent
			)

			expect(response.status).to.equal(200)
			expect(response.data.messages).to.include.members([
				messageContent.content,
			])
		})

		it('Should return 400 if content or sessionId is not provided', async function () {
			// Scenario: Missing content
			try {
				await axios.put(
					`${baseURL}/session/testSessionIdForMessages/messages`,
					{}
				)
			} catch (error) {
				expect(error.response.status).to.equal(400)
				expect(error.response.data.error).to.equal(
					'Content and sessionId is required'
				)
			}
		})

		it('Should return 404 if session is not found', async function () {
			const nonExistentSessionId = 'nonExistentIdForMessages'
			const messageContent = {
				content: 'some_content',
			}
			try {
				await axios.put(
					`${baseURL}/session/${nonExistentSessionId}/messages`,
					messageContent
				)
			} catch (error) {
				expect(error.response.status).to.equal(404)
				expect(error.response.data.error).to.equal('Session not found')
			}
		})
	})

	describe('DELETE /session/:sessionId', function () {
		it('Should successfully delete a session', async function () {
			const response = await axios.delete(
				`${baseURL}/session/${sessionId}`
			)
			expect(response.status).to.equal(200)
			expect(response.data).to.have.property('message', 'Session deleted')
		})

		it('Should return 404 if session is not found', async function () {
			const nonExistentSessionId = 'nonExistentIdForDelete'
			try {
				await axios.delete(`${baseURL}/session/${nonExistentSessionId}`)
			} catch (error) {
				expect(error.response.status).to.equal(404)
				expect(error.response.data.error).to.equal('Session not found')
			}
		})
	})
})
