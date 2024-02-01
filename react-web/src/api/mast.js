// src/api/mast.js
const MAST_API_URL = "https://mast.stsci.edu/api/v0.1/";

export async function searchMast(query) {
  const response = await fetch(`${MAST_API_URL}search/${query}`);
  const data = await response.json();
  return data;
}
