import axios from 'axios';

const API_KEY = '50691194-26f992ad166ae576dbf185fc0';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

export async function fetchImages(query, page = 1) {
    if (!query) throw new Error('Search query is required');

    const params = {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: PER_PAGE,
    };

    try {
        const response = await axios.get(BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Failed to fetch images');
    }
}