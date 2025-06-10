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

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
    e.preventDefault();
    page = 1;
    gallery.innerHTML = '';
    loadMoreBtn.hidden = true;

    const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
    if (!searchQuery) {
        Notiflix.Notify.failure('Please enter a search query');
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
        const data = await fetchImages(query, page);
        
        if (data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        }

        renderGallery(data.hits);
        
        if (page === 1) {
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }

        if (page * 40 >= data.totalHits) {
            loadMoreBtn.hidden = true;
            if (page > 1) {
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            }
        } else {
            loadMoreBtn.hidden = false;
        }

        lightbox.refresh();
        scrollPage();
    } catch (error) {
        Notiflix.Notify.failure('Something went wrong. Please try again later.');
    }
}

function renderGallery(images) {
    const markup = images.map(image => `
        <a href="${image.largeImageURL}" class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
                <p class="info-item"><b>Likes</b>${image.likes}</p>
                <p class="info-item"><b>Views</b>${image.views}</p>
                <p class="info-item"><b>Comments</b>${image.comments}</p>
                <p class="info-item"><b>Downloads</b>${image.downloads}</p>
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