import { fetchImages } from './js/api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';
let lightbox = new SimpleLightbox('.gallery a');

// Initially hide the load more button
loadMoreBtn.style.display = 'none';

// Set up Notiflix configuration
Notiflix.Notify.init({
    position: 'right-top',
    timeout: 3000,
    cssAnimation: true,
    cssAnimationDuration: 400,
});

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
    e.preventDefault();
    page = 1;
    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none';

    const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
    if (!searchQuery) {
        Notiflix.Notify.warning('Please enter a search query');
        return;
    }

    currentQuery = searchQuery;
    await loadImages(searchQuery);
}

async function onLoadMore() {
    page += 1;
    await loadImages(currentQuery);
}

async function loadImages(query) {
    try {
        loadMoreBtn.disabled = true; // Disable button while loading
        const data = await fetchImages(query, page);
        
        if (data.hits.length === 0) {
            loadMoreBtn.style.display = 'none';
            if (page === 1) {
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            } else {
                Notiflix.Notify.info("No more images to load.");
            }
            return;
        }

        renderGallery(data.hits);
        
        if (page === 1) {
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }

        // Check if we've reached the end of available images
        if (page * 40 >= data.totalHits) {
            loadMoreBtn.style.display = 'none';
            Notiflix.Notify.info("Sorry No more images to load.");
        } else {
            loadMoreBtn.style.display = 'block';
        }

        lightbox.refresh();
        if (page > 1) {
            scrollPage();
        }
    } catch (error) {
        Notiflix.Notify.failure('Something went wrong. Please try again later.');
        loadMoreBtn.style.display = 'none';
    } finally {
        loadMoreBtn.disabled = false; // Re-enable button after loading
    }
}

function renderGallery(images) {
    const markup = images.map(image => `
        <a href="${image.largeImageURL}" class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
                <p class="info-item"><b>Likes:</b> ${image.likes}</p>
                <p class="info-item"><b>Views:</b> ${image.views}</p>
                <p class="info-item"><b>Comments:</b> ${image.comments}</p>
                <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
            </div>
        </a>
    `).join('');

    gallery.insertAdjacentHTML('beforeend', markup);
}

function scrollPage() {
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}