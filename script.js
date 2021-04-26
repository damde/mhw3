var oldDescription;

function descriptionHandler(event) {
    if (oldDescription &&
        event.target.parentNode.querySelector("h5") != oldDescription)
        oldDescription.classList.add("hidden")
    const description = event.target.parentNode.querySelector("h5")
    if (description.classList.contains("hidden")) {
        description.classList.remove("hidden")
        oldDescription = description;
    } else {
        description.classList.add("hidden")
        oldDescription = null
    }
}

function onResponseToJSON(response) {
    return response.json()
}

function searchEvent(form) {
    let params = "?"
    form.preventDefault();
    if (form.target.elements.text.value.length > 1)
        params += `name[like]=${form.target.elements.text.value}&`
    if (form.target.elements.stars.value)
        params += `starRating[gte]=${form.target.elements.stars.value}`
    if (params.length > 1) {
        fetchHotels(params)
    }
}

const searchForm = document.querySelector("#search")

searchForm.addEventListener("submit", searchEvent)

const apiKeyIMPALA = "sandb_SQK7gHZvgs0GKjTJjR3qFU0Dpcn9ODGFuPXzULRA"
const baseURLIMPALA = "https://impalaproxy.herokuapp.com/v1"
const apiKeyWeatherStack = "151f12f4ae3c55d832d07ed146732b73"
const baseURLWeatherStack = "http://api.weatherstack.com"

const products = document.querySelector("#products");

function addHotel(hotel) {
    const element = document.createElement("div")
    element.classList.add("card");
    const imageDiv = document.createElement("div")
    imageDiv.classList.add(["image"])
    const image = document.createElement("img")
    image.src = hotel.image
    imageDiv.appendChild(image)
    const text = document.createElement("h3")
    text.classList.add("text");
    text.textContent = hotel.name
    text.addEventListener("click", descriptionHandler)
    const description = document.createElement("h5")
    description.classList.add("hidden")
    description.textContent = hotel.description
    element.appendChild(imageDiv)
    element.appendChild(text)
    element.appendChild(description)
    products.appendChild(element)

    function addWeatherDiv(json) {
        const weatherDiv = document.createElement("div")
        const weatherImg = document.createElement("img")
        const weatherText = document.createElement("h5")
        weatherDiv.id = "weatherDiv"
        weatherImg.id = "weatherImg"
        weatherText.id = "weatherText"
        weatherImg.src = json["current"]["weather_icons"][0]
        weatherText.textContent = hotel.city + ", " 
        + json["current"]["temperature"] + "°"
        weatherDiv.appendChild(weatherImg)
        weatherDiv.appendChild(weatherText)
        element.appendChild(weatherDiv)
    }

    fetch(baseURLWeatherStack + "/current?access_key=" + 
        apiKeyWeatherStack + "&query=" + hotel.city)
        .then(onResponseToJSON)
        .then(addWeatherDiv)
}

function onIMPALAJSON(json) {
    products.innerHTML = ""
    for (let hotel of json.data) {
        const payload = {
            name: hotel.name.split(" [SANDBOX]")[0],
            description: hotel.description.short,
            image: hotel.images[0].url,
            city: hotel.address.city
        }
        addHotel(payload)
    }
}

function fetchHotels(params = "") {
    fetch(baseURLIMPALA + "/hotels" + params, {
        "method": "GET",
        "headers": {
            "x-api-key": apiKeyIMPALA
        }
    })
        .then(onResponseToJSON)
        .then(onIMPALAJSON)
}

fetchHotels()