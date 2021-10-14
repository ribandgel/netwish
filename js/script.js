let pages = {
    'Best': 1,
    'Drama': 1,
    'Sci-Fi': 1,
    'Documentary': 1
}
document.onload = () => {
    let close = document.getElementsByClassName("close")[0]
    let modal = document.getElementById("film-modal")
    close.onclick = function() {
      modal.style.display = "none"
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }
    document.getElementById("cat-menu").addEventListener('click', function() {
      hideAll()
      renderGenres()
    })
    document.getElementById("ac-menu").addEventListener('click', function() {
      hideAll()
      renderHomepage()
    })
} 
async function getAllGenres() {
    let finish = false
    let genres = []
    let url = "http://localhost:8000/api/v1/genres/?page=1"
    while (!finish) {
        const response = await fetch(url).then(response => response.json())
        for (let genre in response["results"]) {
            genres.push(response["results"][genre])
        }
        if (response["next"]) {
            url = response["next"]
        } else {
            finish = true
        }
    }
    return genres
}

async function renderGenres() {
    json = await getAllGenres()
    const categories = document.querySelector('#categories')
    categories.style.display = "block"
    json.forEach(genre => {
        const categorie = document.createElement('div')
        categorie.innerHTML = `<div id=${genre.name}>${genre.name}</div>`
        categories.appendChild(categorie)
    })
}

function hideAll() {
    const categories = document.querySelector('#categories')
    categories.innerHTML = ""
    const betterFilm = document.querySelector('#better-film')
    betterFilm.style.display = "None"
    const sliders = document.querySelector('#sliders')
    sliders.style.display = "None"
}

async function getResponseTitles(page, genre) {
    let url = `http://localhost:8000/api/v1/titles/?genre_contains=${genre}&sort_by=-imdb_score&page=${page}`
    if (genre == "Best") {
        url = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=${page}`
    }
    const response = await fetch(url).then(response => response.json())
    return response
}

async function modale(id) {
    const url = `http://localhost:8000/api/v1/titles/${id}`
    const response = await fetch(url).then(response => response.json())
    const content = document.getElementById("modal-content")
    content.innerHTML = `
        <div>
            <img class="modale-image" src=${response.image_url} >
        </div>
        <ul>
            <li> Title : ${response.title} </li>
            <li> Genres : ${response.genres.toString().replaceAll(",", ", ")} </li>
            <li> Date published : ${response.date_published} </li>
            <li> Rated : ${response.rated} </li>
            <li> Imbd score : ${response.imdb_score} </li>
            <li> Writers : ${response.writers.toString().replaceAll(",", ", ")} </li>
            <li> Actors : ${response.actors.toString().replaceAll(",", ", ")} </li>
            <li> Duration (in minutes) : ${response.duration} </li>
            <li> From : ${response.countries[0]} </li>
            <li> Worldwide gross income : ${response.worldwide_gross_income}$ </li>
            <li> Description : ${response.long_description} </li>
        </ul>
    `
    const modal = document.getElementById("film-modal")
    modal.style.display = "block"
}

async function changeSlide(genre, direction) {
    const sliderParent = document.querySelector(`#${genre}`)
    let back = document.querySelector(`#${genre}-back`)
    let next = document.querySelector(`#${genre}-next`)
    next.innerHTML = ""
    back.innerHTML = ""
    const new_page = pages[genre] + direction
    const response = await getResponseTitles(new_page, genre)
    if (response["next"]) {
        next.innerHTML = `<div class="black" id="${genre}-next" onclick="changeSlide('${genre}',1)">></div>`
    }
    if (response["previous"]) {
        back.innerHTML = `<div class="next" id="${genre}-back" onclick="changeSlide('${genre}',-1)"><</div>`
    }
    
    const titles = response["results"]
    if (titles) {
        pages[genre] = pages[genre] + direction
    } else {
        console.log(titles)
    }
    const slider = document.querySelector(`#${genre}-elements`)
    let elements = ""
    for (index in titles) {
        title = titles[index]
        elements = elements + `<img id=${title.id}-${genre} src=${title.image_url}  onclick="modale(${title.id})">`
    }
    slider.innerHTML = elements
}

async function renderHomepage() {
    const response = await getResponseTitles(1, "Best")
    let betterImdbScoreFilm = response["results"][0]
    const betterFilmElements = document.querySelector('#better-film-elements')
    document.querySelector("#better-film").style.display = ""
    betterFilmElements.innerHTML = `
        <span id=better-film-title> ${betterImdbScoreFilm.title} </span>
        <button id=better-film-play onclick="modale(${betterImdbScoreFilm.id})"> Play </button>
    `
    const image = document.querySelector('#better-film-image')
    image.innerHTML = `<img id=${betterImdbScoreFilm.id}-img src=${betterImdbScoreFilm.image_url} onclick="modale(${betterImdbScoreFilm.id})">`
    document.querySelector('#sliders').style.display = "block"
    const genres = ["Best", "Drama", "Sci-Fi", "Documentary"]
    for (let index in genres) {
        changeSlide(genres[index], 0)
    }

}