const axios = require('axios');
require('dotenv').config();

async function testGoogle() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  console.log(`🔍 Testando Google Maps API com a chave: ${key.substring(0, 8)}...\n`);

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: 'bar in Cascavel, Paraná, Brazil',
          key: key
        }
      }
    );

    console.log(`📡 Status da Resposta: ${response.data.status}`);
    
    if (response.data.status === 'OK') {
      console.log(`✅ Sucesso! Encontrados ${response.data.results.length} resultados.`);
      console.log(`📍 Exemplo: ${response.data.results[0].name}`);
    } else {
      console.log(`❌ Erro na API: ${response.data.error_message || 'Sem mensagem de erro'}`);
    }
  } catch (error) {
    console.error(`❌ Falha na requisição: ${error.message}`);
  }
}

testGoogle();
