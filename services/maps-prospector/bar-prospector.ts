import { Client } from '@notionhq/client';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Google Places API types
interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  business_status: string;
  opening_hours?: {
    open_now: boolean;
  };
}

interface PlaceDetails extends PlaceResult {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  current_opening_hours?: {
    weekday_text: string[];
  };
}

/**
 * Maps Prospector Agent for Mansão Maromba
 * Searches Google Maps for bars across Brazilian states and syncs to Notion
 */
export class MapsProspectorAgent {
  private notion: Client;
  private googleApiKey: string;
  private prospectDbId: string;

  constructor(notionToken: string, googleApiKey: string, prospectDbId: string) {
    this.notion = new Client({ auth: notionToken });
    this.googleApiKey = googleApiKey;
    this.prospectDbId = prospectDbId;
  }

  /**
   * Cities configuration by state
   */
  public static readonly BRAZIL_STATES_CITIES: Record<string, string[]> = {
    'Mato Grosso': ['Cuiabá'],
    'MT': ['Cuiabá'],
    'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
    'São Paulo': ['São Paulo', 'Campinas', 'Guarulhos', 'São Bernardo do Campo', 'Santo André', 'Ribeirão Preto'],
    'Rio de Janeiro': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Niterói', 'Nova Iguaçu', 'Petrópolis'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Uberaba'],
    'Pernambuco': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista'],
    'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
    'Santa Catarina': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Chapecó'],
    'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria']
  };

  /**
   * Search for bars in specific states
   */
  async searchBarsInStates(states: string[], keywords: string[] = ['bar', 'pub', 'distribuidora de bebidas']): Promise<PlaceResult[]> {
    const results: PlaceResult[] = [];

    for (const state of states) {
      const cities = MapsProspectorAgent.BRAZIL_STATES_CITIES[state] || [state];
      console.log(`\n🔎 Starting search in state: ${state} (${cities.length} cities)`);

      for (const city of cities) {
        for (const keyword of keywords) {
          try {
            const query = `${keyword} in ${city}, ${state}, Brazil`;
            const places = await this.searchGooglePlaces(query);

            // Filter for relevant businesses and operational status
            const filtered = places.filter(place =>
              (place.types.includes('bar') ||
                place.types.includes('liquor_store') ||
                place.types.includes('night_club') ||
                place.types.includes('restaurant')) &&
              place.business_status === 'OPERATIONAL'
            );

            results.push(...filtered);
            console.log(`  ✓ Found ${filtered.length} targets in ${city} for "${keyword}"`);

            // Rate limiting to avoid hitting Google API limits too fast
            await this.delay(500);
          } catch (error) {
            console.error(`  ❌ Error searching ${city} for ${keyword}:`, error);
          }
        }
      }
    }

    // Remove duplicates based on place_id
    const uniqueResults = results.filter((place, index, self) =>
      index === self.findIndex(p => p.place_id === place.place_id)
    );

    return uniqueResults;
  }

  /**
   * Get detailed information for a place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,current_opening_hours,types,business_status,geometry',
            key: this.googleApiKey,
            language: 'pt-BR'
          }
        }
      );

      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        console.error(`Place details error for ${placeId}:`, response.data.status);
        return null;
      }
    } catch (error) {
      console.error(`Error getting place details for ${placeId}:`, error);
      return null;
    }
  }

  /**
   * Check if a prospect already exists in Notion
   */
  async checkExistingProspect(prospectName: string, address: string): Promise<boolean> {
    try {
      // Query by name first
      const response = await this.notion.databases.query({
        database_id: this.prospectDbId,
        filter: {
          property: 'Nome do Estabelecimento',
          title: {
            equals: prospectName
          }
        }
      });

      if (response.results.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking existing prospect:', error);
      return false;
    }
  }

  /**
   * Create a new prospect in Notion
   */
  async createProspect(details: PlaceDetails): Promise<void> {
    try {
      // Extract city and state from formatted address if possible
      const addressParts = details.formatted_address.split(', ');
      let city = 'Desconhecido';
      let state = 'MT';
      let neighborhood = 'Desconhecido';

      for (const part of addressParts) {
        if (part.includes(' - ')) {
          const subParts = part.split(' - ');
          if (subParts.length >= 2) {
            neighborhood = subParts[1].trim();
            city = subParts[0].trim();
            const possibleState = subParts[2]?.trim() || '';
            if (possibleState.length === 2) state = possibleState;
          }
        }
      }

      // Determine Establishment Type from Google Types
      let type = 'Bar';
      if (details.types.includes('liquor_store')) type = 'Distribuidora';
      else if (details.types.includes('supermarket') || details.types.includes('grocery_or_supermarket')) type = 'Mercado';

      const properties: any = {
        'Nome do Estabelecimento': {
          title: [{ text: { content: details.name } }]
        },
        'Estado': {
          select: { name: state }
        },
        'Cidade': {
          rich_text: [{ text: { content: city } }]
        },
        'Bairro': {
          rich_text: [{ text: { content: neighborhood } }]
        },
        'Tipo de Estabelecimento': {
          select: { name: type }
        },
        'Status de Venda': {
          select: { name: 'Sem contato' }
        },
        'Telefone / WhatsApp': details.formatted_phone_number ? {
          phone_number: details.formatted_phone_number
        } : undefined,
        'Link Google Maps': {
          url: `https://www.google.com/maps/place/?q=place_id:${details.place_id}`
        },
        'Último Contato': {
          date: { start: new Date().toISOString().split('T')[0] }
        }
      };

      // Build comprehensive notes
      let notes = `📍 Endereço: ${details.formatted_address}\n`;
      if (details.rating) notes += `⭐ Avaliação: ${details.rating}/5 (${details.user_ratings_total || 0} reviews)\n`;
      if (details.website) notes += `🌐 Website: ${details.website}\n`;
      
      if (details.current_opening_hours?.weekday_text) {
        notes += `\n🕒 Horários:\n${details.current_opening_hours.weekday_text.join('\n')}\n`;
      }

      properties['Observações'] = {
        rich_text: [{ text: { content: notes.substring(0, 2000) } }]
      };

      await this.notion.pages.create({
        parent: { database_id: this.prospectDbId },
        properties
      });

      console.log(`  ✅ Prospect criado: ${details.name}`);
    } catch (error: any) {
      console.error(`  ❌ Erro ao criar prospect ${details.name}:`, error.response?.data || error.message);
    }
  }

  /**
   * Main orchestration method
   */
  async orchestrateBarProspecting(states: string[] = ['Mato Grosso']): Promise<{
    totalFound: number;
    newProspects: number;
    prospects: PlaceDetails[];
  }> {
    console.log(`\n🚀 INICIANDO PROSPECÇÃO DE BARES EM: ${states.join(', ')}`);
    console.log('===========================================================');
    console.log(`🔑 Usando Banco de Dados: ${this.prospectDbId}`);

    // Search for bars
    const bars = await this.searchBarsInStates(states);
    console.log(`\n📊 Total de estabelecimentos encontrados pelo Google Maps: ${bars.length}`);

    if (bars.length === 0) {
      console.log('⚠️ Nenhum bar encontrado. Verifique sua Google API Key e limites.');
      return { totalFound: 0, newProspects: 0, prospects: [] };
    }

    const prospects: PlaceDetails[] = [];
    let newProspectsCount = 0;

    // Get details and check/create in Notion
    for (const bar of bars) {
      try {
        console.log(`\n🔎 Processando: ${bar.name}...`);
        
        // First check if it exists by name to save API calls
        const exists = await this.checkExistingProspect(bar.name, bar.formatted_address);
        if (exists) {
          console.log(`  ⊘ Já existe no Notion: ${bar.name}`);
          continue;
        }

        console.log(`  ➕ Buscando detalhes completos no Google...`);
        const details = await this.getPlaceDetails(bar.place_id);
        if (!details) {
          console.log(`  ⚠️ Não foi possível obter detalhes para: ${bar.name}`);
          continue;
        }

        console.log(`  💾 Criando novo registro no Notion...`);
        await this.createProspect(details);
        prospects.push(details);
        newProspectsCount++;

        // Rate limiting for Notion and Google
        await this.delay(500);
      } catch (error) {
        console.error(`  ❌ Erro ao processar ${bar.name}:`, error);
      }
    }

    console.log('\n===========================================================');
    console.log(`✅ ORQUESTRAÇÃO CONCLUÍDA: ${newProspectsCount} novos leads adicionados com sucesso!`);

    return {
      totalFound: bars.length,
      newProspects: newProspectsCount,
      prospects
    };
  }

  /**
   * Search Google Places API
   */
  private async searchGooglePlaces(query: string): Promise<PlaceResult[]> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`,
        {
          params: {
            query,
            key: this.googleApiKey,
            language: 'pt-BR',
            region: 'br'
          }
        }
      );

      if (response.data.status === 'OK') {
        return response.data.results;
      } else if (response.data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        console.error(`    Places API Status: ${response.data.status} for query "${query}"`);
        return [];
      }
    } catch (error) {
      console.error(`    Error searching places for "${query}":`, error);
      return [];
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI runner
async function main() {
  const notionToken = process.env.NOTION_TOKEN;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const prospectDbId = process.env.PROSPECT_DB_ID;

  if (!notionToken || !googleApiKey || !prospectDbId) {
    console.error('❌ Faltam variáveis de ambiente: NOTION_TOKEN, GOOGLE_PLACES_API_KEY, PROSPECT_DB_ID');
    process.exit(1);
  }

  // Get states from command line arguments or default to Paraná
  const args = process.argv.slice(2);
  const statesToProcess = args.length > 0 ? args : ['Mato Grosso'];

  const agent = new MapsProspectorAgent(notionToken, googleApiKey, prospectDbId);
  await agent.orchestrateBarProspecting(statesToProcess);
}
