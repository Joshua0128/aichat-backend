const OpenAI = require('openai')
const transformMessages = require('./helper')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const openAIChat = async (messages) => {
	if (messages.length == 0) {
		return
	} else {
		messages = transformMessages(messages)
		const completion = await openai.chat.completions.create({
			messages,
			model: 'gpt-3.5-turbo',
			max_tokens: 80,
		})
		return completion.choices[0]
	}
}

module.exports = openAIChat
