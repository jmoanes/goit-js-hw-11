import { fetchImages } from './js/api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';
let lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

// Initialize Notiflix
Notiflix.Notify.init({
    position: 'right-top',
    timeout: 3000,
    cssAnimation: true,
    cssAnimationDuration: 400,
});

// Initially hide load more button
loadMoreBtn.style.display = 'none';

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
    e.preventDefault();
    
    const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
    if (!searchQuery) {
        Notiflix.Notify.warning('Please enter a search query');
        return;
    }

    page = 1;
    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    currentQuery = searchQuery;
    
    await loadImages(searchQuery);
}

async function onLoadMore() {
    if (!currentQuery) return;
    
    page += 1;
    loadMoreBtn.disabled = true;
    await loadImages(currentQuery);
    loadMoreBtn.disabled = false;
}

async function loadImages(query) {
    try {
        const data = await fetchImages(query, page);
        
        if (!data || !data.hits || data.hits.length === 0) {
            if (page === 1) {
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            } else {
                Notiflix.Notify.info("We've reached the end of search results.");
            }
            loadMoreBtn.style.display = 'none';
            return;
        }

        renderGallery(data.hits);
        
        if (page === 1) {
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }

        // Check if we've reached the end or the 500 image limit
        const totalLoadedImages = page * 40;
        if (totalLoadedImages >= data.totalHits || totalLoadedImages >= 500) {
            loadMoreBtn.style.display = 'none';
            if (data.hits.length > 0) {
                Notiflix.Notify.info("You've reached the end of search results.");
            }
        } else {
            loadMoreBtn.style.display = 'block';
        }

        lightbox.refresh();
        
        if (page > 1) {
            smoothScroll();
        }
    } catch (error) {
        console.error('Error loading images:', error);
        Notiflix.Notify.failure('Something went wrong. Please try again later.');
        loadMoreBtn.style.display = 'none';
    }
}

function renderGallery(images) {
    if (!Array.isArray(images)) return;

    const markup = images.map(image => {
        try {
            return `
                <a href="${image.largeImageURL}" class="photo-card">
                    <img 
                        src="${image.webformatURL}" 
                        alt="${image.tags}" 
                        loading="lazy" 
                        width="300" 
                        height="200"
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';"
                    />
                    <div class="info">
                        <p class="info-item"><b>Likes:</b> ${image.likes || 0}</p>
                        <p class="info-item"><b>Views:</b> ${image.views || 0}</p>
                        <p class="info-item"><b>Comments:</b> ${image.comments || 0}</p>
                        <p class="info-item"><b>Downloads:</b> ${image.downloads || 0}</p>
                    </div>
                </a>
            `;
        } catch (error) {
            console.error('Error rendering image:', error);
            return '';
        }
    }).filter(Boolean).join('');

    if (markup) {
        gallery.insertAdjacentHTML('beforeend', markup);
        
        const newImages = gallery.querySelectorAll('img');
        newImages.forEach(img => {
            img.addEventListener('load', () => {
                lightbox.refresh();
            });
            img.addEventListener('error', () => handleImageError(img));
        });
    }
}

function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
}

function smoothScroll() {
    try {
        const { height: cardHeight } = document
            .querySelector(".gallery")
            .firstElementChild.getBoundingClientRect();

        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
    } catch (error) {
        console.error('Error scrolling:', error);
    }
}