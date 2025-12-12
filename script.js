// CONFIG
const API_KEY = "70db1495b768deb88b72690439ba9fde"; 
const API_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500"; 

let currentTab = 'all';
let currentSeriesInModal = null;

// 1. DATABASE (Local Storage)
let myLibrary = JSON.parse(localStorage.getItem('netflixFocusDB')) || [];

// DOM Elements
const grid = document.getElementById('animeGrid');
const loading = document.getElementById('loading');
const modal = document.getElementById('animeModal');
const btns = document.querySelectorAll('.tab-btn');

// --- INITIALIZATION ---
window.onload = () => {
    switchTab('all');
};

// --- TAB LOGIC ---
function switchTab(tabName) {
    currentTab = tabName;
    btns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if(activeBtn) activeBtn.classList.add('active');

    if (tabName === 'all') {
        getNetflixSeries();
    } else {
        renderLibrary(tabName);
    }
}

// --- API FUNCTIONS ---
async function getNetflixSeries() {
    loading.style.display = 'block';
    grid.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&sort_by=popularity.desc`);
        const data = await response.json();
        renderCards(data.results); 
    } catch (error) {
        console.error(error);
        grid.innerHTML = "<p>Error loading series. Check Console.</p>";
    } finally {
        loading.style.display = 'none';
    }
}

async function searchSeries() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;
    switchTab('all'); 
    loading.style.display = 'block';
    grid.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}/search/tv?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        renderCards(data.results);
    } catch (error) {
        console.error(error);
    } finally {
        loading.style.display = 'none';
    }
}

// --- RENDER FUNCTIONS ---
function renderCards(seriesList) {
    grid.innerHTML = '';
    if (!seriesList || seriesList.length === 0) {
        grid.innerHTML = "<p>No series found.</p>";
        return;
    }

    seriesList.forEach(series => {
        // DATA NORMALIZATION
        const id = series.id;
        const title = series.title || series.name || series.original_name || "Untitled";
        
        let img = "https://via.placeholder.com/200x300?text=No+Image";
        if (series.img) img = series.img; 
        else if (series.poster_path) img = `${IMG_BASE_URL}${series.poster_path}`;

        const score = series.score || (series.vote_average ? series.vote_average.toFixed(1) : '?');
        const synopsis = series.synopsis || series.overview || "No description available.";
        
        const totalEps = (series.totalEps && series.totalEps !== 'undefined') ? series.totalEps : '?';
        const watchedEps = series.watchedEps || 0;
        const status = series.status || null;

        // CALCULATE PROGRESS
        let progressHTML = '';
        let buttonHTML = '';

        if (status) {
            let percentage = 0;
            
            // LOGIC FIX: Ensure display shows 100% and max eps if completed
            if (status === 'completed') {
                percentage = 100;
                buttonHTML = `<button class="btn-watch-again" onclick="watchAgain(${id}, event)">Watch Again</button>`;
            } else if (totalEps !== '?' && totalEps > 0) {
                percentage = (watchedEps / totalEps) * 100;
                if(percentage > 100) percentage = 100;
            }

            progressHTML = `
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="ep-count-display">${watchedEps} / ${totalEps} EP</div>
            `;
        }

        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${img}" alt="${title}">
            <div class="card-info">
                <div class="card-title">${title}</div>
                <div class="card-meta">
                    <span>★ ${score}</span>
                    <span>${status ? status.toUpperCase() : 'TV Series'}</span>
                </div>
                ${progressHTML}
                ${buttonHTML}
            </div>
        `;

        const seriesObj = { id, title, img, score, synopsis, totalEps, watchedEps, status };
        
        card.onclick = (e) => {
            if(!e.target.classList.contains('btn-watch-again')) {
                openModal(seriesObj);
            }
        };
        
        grid.appendChild(card);
    });
}

function renderLibrary(statusFilter) {
    const filteredList = myLibrary.filter(item => item.status === statusFilter);
    if (filteredList.length === 0) {
        grid.innerHTML = `<p style="color:#ccc; margin-top:20px;">No series found in "${statusFilter}".</p>`;
        return;
    }
    renderCards(filteredList);
}

function watchAgain(id, event) {
    event.stopPropagation();
    const index = myLibrary.findIndex(item => item.id === id);
    if (index > -1) {
        myLibrary[index].status = 'plan_to_watch';
        myLibrary[index].watchedEps = 0;
        localStorage.setItem('netflixFocusDB', JSON.stringify(myLibrary));
        
        if(currentTab === 'completed') {
            renderLibrary('completed');
        } else {
            switchTab('plan_to_watch');
        }
    }
}

// --- MODAL & LOGIC ---
async function openModal(series) {
    const existingEntry = myLibrary.find(item => item.id === series.id);
    
    let currentTotal = '?';
    if (existingEntry && existingEntry.totalEps && existingEntry.totalEps !== 'undefined' && existingEntry.totalEps !== '?') {
        currentTotal = existingEntry.totalEps;
    }

    currentSeriesInModal = { 
        ...series, 
        watchedEps: existingEntry ? existingEntry.watchedEps : 0,
        totalEps: currentTotal
    };

    // UI Updates
    document.getElementById('modalImg').src = currentSeriesInModal.img;
    document.getElementById('modalTitle').innerText = currentSeriesInModal.title;
    document.getElementById('modalMeta').innerText = `Score: ${currentSeriesInModal.score}`;
    document.getElementById('modalSynopsis').innerText = currentSeriesInModal.synopsis;
    document.getElementById('modalTotalEps').innerText = (currentTotal === '?') ? 'Loading...' : currentTotal;

    const statusSelect = document.getElementById('modalStatus');
    const progressInput = document.getElementById('modalProgress');
    const deleteBtn = document.getElementById('btnDelete');

    if (existingEntry) {
        statusSelect.value = existingEntry.status;
        progressInput.value = existingEntry.watchedEps;
        deleteBtn.style.display = 'block';
    } else {
        statusSelect.value = 'watching'; 
        progressInput.value = 0;
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';

    if (currentTotal === '?') {
        fetchDetailsAndUpdate(series.id);
    }
}

async function fetchDetailsAndUpdate(id) {
    try {
        const res = await fetch(`${API_URL}/tv/${id}?api_key=${API_KEY}`);
        const data = await res.json();
        
        if (data.number_of_episodes) {
            if (currentSeriesInModal && currentSeriesInModal.id === id) {
                currentSeriesInModal.totalEps = data.number_of_episodes;
                document.getElementById('modalTotalEps').innerText = data.number_of_episodes;
            }
            const dbIndex = myLibrary.findIndex(item => item.id === id);
            if (dbIndex > -1) {
                myLibrary[dbIndex].totalEps = data.number_of_episodes;
                localStorage.setItem('netflixFocusDB', JSON.stringify(myLibrary));
                if(currentTab !== 'all') renderLibrary(currentTab);
            }
        }
    } catch (e) {
        console.error("Could not fetch details", e);
        document.getElementById('modalTotalEps').innerText = '?';
    }
}

// --- SAVE FUNCTION (UPDATED) ---
function saveToLibrary() {
    let status = document.getElementById('modalStatus').value;
    let watched = parseInt(document.getElementById('modalProgress').value) || 0;

    // --- FIX 1: If user selects COMPLETED, Force Watched = Total ---
    if (status === 'completed') {
        if (currentSeriesInModal.totalEps !== '?' && currentSeriesInModal.totalEps > 0) {
            watched = currentSeriesInModal.totalEps;
        }
    }

    // --- FIX 2: Auto-move to Watching if episodes added ---
    if (status === 'plan_to_watch' && watched > 0) {
        status = 'watching';
        alert("Moved to Watching List automatically!");
    }

    // --- FIX 3: Auto-complete if max episodes reached manually ---
    if (currentSeriesInModal.totalEps !== '?' && watched >= currentSeriesInModal.totalEps) {
        status = 'completed';
        // Ensure we don't save a number higher than total
        watched = currentSeriesInModal.totalEps; 
    }

    const existingIndex = myLibrary.findIndex(item => item.id === currentSeriesInModal.id);

    const newEntry = {
        ...currentSeriesInModal,
        status: status,
        watchedEps: watched
    };

    if (existingIndex > -1) {
        myLibrary[existingIndex] = newEntry; 
    } else {
        myLibrary.push(newEntry); 
    }

    localStorage.setItem('netflixFocusDB', JSON.stringify(myLibrary));
    closeModal();

    if (currentTab !== 'all') {
        renderLibrary(currentTab);
    } else {
        alert(`Saved to ${status}!`);
    }
}

function deleteFromLibrary() {
    if (confirm("Remove this series from your list?")) {
        myLibrary = myLibrary.filter(item => item.id !== currentSeriesInModal.id);
        localStorage.setItem('netflixFocusDB', JSON.stringify(myLibrary));
        closeModal();

        if (currentTab !== 'all') renderLibrary(currentTab);
        else alert("Removed from list.");
    }
}

document.querySelector('.close-btn').onclick = closeModal;
window.onclick = function(event) {
    if (event.target == modal) closeModal();
}

function closeModal() {
    modal.style.display = "none";
}