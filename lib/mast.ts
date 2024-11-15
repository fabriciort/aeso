const MAST_API_URL = "https://mast.stsci.edu/api/v0.1/"

export interface MastSearchResponse {
  // Define your response type here based on the API
  data: any[]
  // Add other fields as needed
}

export async function searchMast(query: string): Promise<MastSearchResponse> {
  const response = await fetch(`${MAST_API_URL}search/${query}`)
  if (!response.ok) {
    throw new Error('Failed to fetch from MAST API')
  }
  return response.json()
} 