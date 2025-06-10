// filepath: c:\Users\syste\Desktop\goit-js-hw-11\src\js\api.js
import axios from 'axios';

const API_KEY = '50691194-26f992ad166ae576dbf185fc0';
const BASE_URL = 'https://pixabay.com/api/';

export async function fetchImages(query, page = 1, perPage = 40) {
    const params = {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: perPage,
    };

    try {
        const response = await axios.get(BASE_URL, { params });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch images');
    }
}