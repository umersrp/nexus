import axios from 'axios';

export async function generateSpeech(query, voice) {
  const apiKey =''
  const apiUrl = ''

  const requestData = {
    model: 'tts-1',
    input: query,
    voice: voice,
  };

  try {
    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: requestData,
      responseType: 'arraybuffer', // Necessary to handle binary audio response
    });

    const buffer = Buffer.from(await response?.data);

    const base64String = buffer.toString('base64');

    const base64Audio = `data:audio/mp3;base64,${base64String}`;
    return base64Audio;
  } catch (error) {
    console.error(
      'Error generating speech:',
      error.response?.data || error.message
    );
  }
}
