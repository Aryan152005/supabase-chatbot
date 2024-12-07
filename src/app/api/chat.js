import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export default async function handler(req, res) {
  const { prompt, sessionId, userId } = req.body;

  try {
    // If you are using conversation history, pass the whole message array (adjust as needed)
    const conversationHistory = prompt; // Or use `messages` if you are keeping multiple messages

    const response = await hf.textGeneration({
      model: 'gpt2',  // GPT-2 model
      inputs: conversationHistory,
      parameters: {
        max_length: 100,  // Max tokens for response
        temperature: 0.7,
      },
    });

    // Respond with AI's generated text
    res.status(200).json({ text: response.generated_text, sessionId: sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch response from chat API' });
  }
}
