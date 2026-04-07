// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');



// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
const gallery = document.getElementById('gallery');
const pagination = document.getElementById('pagination');
const spaceFactSection = document.getElementById('space-fact');
const itemsPerPage = 18;
let currentCards = [];
let currentPage = 1;

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Neutron stars can spin at more than 600 times per second.',
  'Jupiter has the shortest day of all planets at about 10 hours.',
  'The footprints left on the Moon can last for millions of years.',
  'Saturn could float in water because it is mostly made of gas.',
  'Light from the Sun takes about 8 minutes to reach Earth.'
];

// Stuff for Modal Pup-up (DOM)
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalDescription = document.getElementById('modal-description');
const modalDate = document.getElementById('modal-date');
const modalCopyright = document.getElementById('modal-copyright');
const modalCloseBtn = document.getElementById('modal-close');

const fetchSpace = (startDate, endDate) => {

  const API_KEY = "d7478Vs88ksS4peu1MiAHsWuMeIYoBigrzIFrfp9";
  const API_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  return fetch(API_URL)
  .then(response => {

  if(!response.ok){
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
  })
  .catch(error => console.error(error));


};

const getVideoEmbedUrl = (url) => {
  // Convert common YouTube and Vimeo links into embeddable URLs.
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }

  return url;
};

const openModal = (card) => {
  modalTitle.textContent = card.title;
  modalImage.src = card.url || card.hdurl;
  modalImage.alt = card.title;
  modalDescription.textContent = card.explanation;
  modalDate.textContent = card.date;

  if (card.copyright) {
    modalCopyright.textContent = `Copyright: ${card.copyright}`;
    modalCopyright.style.display = 'block';
  } else {
    modalCopyright.textContent = '';
    modalCopyright.style.display = 'none';
  }

  modal.classList.remove('modal-hidden');
};

const closeModal = () => {
  modal.classList.add('modal-hidden');
};

const renderRandomSpaceFact = () => {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const randomFact = spaceFacts[randomIndex];

  const factTitle = document.createElement('h2');
  factTitle.classList.add('space-fact-title');
  factTitle.textContent = 'Did You Know?';

  const factText = document.createElement('p');
  factText.classList.add('space-fact-text');
  factText.textContent = randomFact;

  spaceFactSection.innerHTML = '';
  spaceFactSection.appendChild(factTitle);
  spaceFactSection.appendChild(factText);
};

const showLoadingMessage = () => {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading space images...</p>
    </div>
  `;
  pagination.innerHTML = '';
};

const renderPagination = () => {
  const totalPages = Math.ceil(currentCards.length / itemsPerPage);

  pagination.innerHTML = '';

  if (totalPages <= 1) {
    return;
  }

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = document.createElement('button');
    pageButton.type = 'button';
    pageButton.textContent = page;
    pageButton.classList.add('pagination-button');

    if (page === currentPage) {
      pageButton.classList.add('active');
    }

    pageButton.addEventListener('click', () => {
      currentPage = page;
      renderGallery();
    });

    pagination.appendChild(pageButton);
  }
};

const renderGallery = () => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleCards = currentCards.slice(startIndex, endIndex);

  gallery.innerHTML = '';

  visibleCards.forEach((card) => {
    const imageCard = document.createElement('div');
    imageCard.classList.add('gallery-item');

    if (card.media_type === 'video') {
      const isYouTube = card.url.includes('youtube.com') || card.url.includes('youtu.be');
      imageCard.innerHTML = `
        <a
          class="video-placeholder"
          href="${card.url}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch APOD video">
          <span class="video-badge">VIDEO</span>
          <span class="video-play">▶</span>
          <span class="video-text">Watch APOD Video${isYouTube ? ' YouTube' : ''}</span>
        </a>
      `;
    } else {
      imageCard.classList.add('image-card');
      const previewImage = card.thumbnail_url || card.hdurl || card.url;
      imageCard.innerHTML = `
        <img src="${previewImage}" alt="${card.title}">
      `;

      imageCard.addEventListener('click', () => {
        openModal(card);
      });
    }

    gallery.appendChild(imageCard);
  });

  renderPagination();
};

const displayImages = () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  showLoadingMessage();

  fetchSpace(startDate, endDate).then((data) => {
    if (!data) return;

    currentCards = data;
    currentPage = 1;
    renderGallery();
  });
};


// Load once with the default date range from setupDateInputs
renderRandomSpaceFact();
displayImages();

// Update only when the user changes the date range
startInput.addEventListener('change', displayImages);
endInput.addEventListener('change', displayImages);

// Modal close interactions
modalCloseBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
