import { Client } from '@notionhq/client';
import axios from 'axios';

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
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
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
 * Maps Prospector Agent for Paraná Bars
 * Searches Google Maps for bars in Paraná, Brazil and syncs to Notion
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
   * Search for bars in Paraná state, Brazil
   */
  async searchBarsInParana(keywords: string[] = ['bar', 'pub', 'drink', 'beverages']): Promise<PlaceResult[]> {
    const results: PlaceResult[] = [];
    const paranaCities = [
      'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
      'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'
    ];

    for (const city of paranaCities) {
      for (const keyword of keywords) {
        try {
          const query = `${keyword} in ${city}, Paraná, Brazil`;
          const places = await this.searchGooglePlaces(query);

          // Filter for bars/pubs and operational businesses
          const bars = places.filter(place =>
            place.types.includes('bar') ||
            place.types.includes('restaurant') ||
            place.types.includes('night_club') ||
            place.business_status === 'OPERATIONAL'
          );

          results.push(...bars);
          console.log(`Found ${bars.length} bars in ${city} for keyword "${keyword}"`);

          // Rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`Error searching ${city} for ${keyword}:`, error);
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
   * Get detailed information for a place including phone number
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,current_opening_hours,types,business_status',
            key: this.googleApiKey
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
  async checkExistingProspect(prospectName: string): Promise<boolean> {
    try {
      const response = await this.notion.databases.query({
        database_id: this.prospectDbId,
        filter: {
          property: 'Prospect Name',
          title: {
            equals: prospectName
          }
        }
      });

      return response.results.length > 0;
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
      const properties: any = {
        'Prospect Name': {
          title: [{ text: { content: details.name } }]
        },
        'Funnel Stage': {
          select: { name: 'Lead' }
        },
        'Phone': details.formatted_phone_number ? {
          phone_number: details.formatted_phone_number
        } : undefined,
        'Last Contact': {
          date: { start: new Date().toISOString().split('T')[0] }
        }
      };

      // Build comprehensive notes
      let notes = `Location: ${details.formatted_address}\n`;
      if (details.rating) notes += `Rating: ${details.rating}/5 (${details.user_ratings_total || 0} reviews)\n`;
      if (details.website) notes += `Website: ${details.website}\n`;
      if (details.international_phone_number) notes += `International Phone: ${details.international_phone_number}\n`;

      if (details.current_opening_hours?.weekday_text) {
        notes += `\nHours:\n${details.current_opening_hours.weekday_text.join('\n')}\n`;
      }

      if (details.reviews && details.reviews.length > 0) {
        notes += `\nRecent Reviews:\n`;
        details.reviews.slice(0, 3).forEach(review => {
          notes += `- ${review.author_name} (${review.rating}★): ${review.text.substring(0, 100)}...\n`;
        });
      }

      notes += `\n---\nCall Script: "Olá, sou representante da Mansão Maromba. Gostaria de saber se vocês têm interesse em oferecer nossos drinks energéticos no estabelecimento?"`;

      properties['Notes'] = {
        rich_text: [{ text: { content: notes } }]
      };

      await this.notion.pages.create({
        parent: { database_id: this.prospectDbId },
        properties
      });

      console.log(`Created prospect: ${details.name}`);
    } catch (error) {
      console.error(`Error creating prospect ${details.name}:`, error);
    }
  }

  /**
   * Main orchestration method
   */
  async orchestrateBarProspecting(): Promise<{
    totalFound: number;
    newProspects: number;
    prospects: PlaceDetails[];
  }> {
    console.log('Starting bar prospecting in Paraná, Brazil...');

    // Search for bars
    const bars = await this.searchBarsInParana();
    console.log(`Found ${bars.length} total bars`);

    const prospects: PlaceDetails[] = [];
    let newProspects = 0;

    // Get details and check/create in Notion
    for (const bar of bars) {
      try {
        const details = await this.getPlaceDetails(bar.place_id);
        if (!details) continue;

        const exists = await this.checkExistingProspect(details.name);
        if (!exists) {
          await this.createProspect(details);
          prospects.push(details);
          newProspects++;
        }

        // Rate limiting
        await this.delay(500);
      } catch (error) {
        console.error(`Error processing ${bar.name}:`, error);
      }
    }

    console.log(`Orchestration complete: ${newProspects} new prospects added to Notion`);

    return {
      totalFound: bars.length,
      newProspects,
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
      } else {
        console.error(`Places search error for "${query}":`, response.data.status);
        return [];
      }
    } catch (error) {
      console.error(`Error searching places for "${query}":`, error);
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
    console.error('Missing required environment variables: NOTION_TOKEN, GOOGLE_PLACES_API_KEY, PROSPECT_DB_ID');
    process.exit(1);
  }

  const agent = new MapsProspectorAgent(notionToken, googleApiKey, prospectDbId);
  const result = await agent.orchestrateBarProspecting();

  console.log('\n=== RESULTS ===');
  console.log(`Total bars found: ${result.totalFound}`);
  console.log(`New prospects added: ${result.newProspects}`);

  if (result.prospects.length > 0) {
    console.log('\nNew Prospects:');
    result.prospects.forEach(prospect => {
      console.log(`- ${prospect.name}: ${prospect.formatted_phone_number || 'No phone'}`);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

