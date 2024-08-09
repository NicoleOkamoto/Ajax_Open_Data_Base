/******w**************
    
    Assignment 4 Javascript
    Name:Nicole Aline Okamot Goncalves 
    Date: 04/05/2024
    Description: Assignment 4 AJAX Using Open Data

*********************/

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    addAmenityLinkEventListeners();
    addFormSubmitEventListener();
});

// Add links to the list of amenities available 
function addAmenityLinkEventListeners() {
    // Add event listeners for amenity links
    const amenityLinks = document.querySelectorAll('.amenity-link');
    amenityLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const amenity = link.dataset.amenity;
            document.getElementById('amenity').value = amenity;
        });
    });
}

function addFormSubmitEventListener() {
    // Add event listener for form submission
    document.getElementById('search-form').addEventListener('submit', function (event) {
        event.preventDefault();
        handleFormSubmission();
    });
}

function handleFormSubmission() {
    // Get the value of the amenity input field (case insensitive) and sanitize it
    const amenity = DOMPurify.sanitize(document.getElementById('amenity').value.trim().toLowerCase());

    // Validate the amenity input
    if (amenity === '') {
        alert('Please enter an amenity.');
        return;
    }

    fetchDataAndDisplayResults(amenity);

    this.reset();
}

// Querying the Open Data API
function fetchDataAndDisplayResults(amenity) {
    const apiUrl = 'https://data.winnipeg.ca/resource/bmi4-vvs2.json' +
    '?$limit=190' + // Limit to 190 records avoid over loading
    '&$where= 1=1' + //Just iniate the where as per requirement, data filtering executed in the filteredData funtion.
    '&$order=complex_name ASC'; // Order by complex_name in ascending order

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const filteredData = filterData(data, amenity);
            displaySearchResults(filteredData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please try again.');
        });
}


// Filter Data
function filterData(data, amenity) {
    // Define manual mapping from user input to API keys improving UX
    const manualMapping = {
        'indoor pool': 'indoor_pool',
        'outdoor pool': 'outdoor_pool',
        'swimming pool': 'indoor_pool',
        'wading pool': 'wading_pool',
        'swim': ['indoor_pool', 'outdoor_pool', 'wading_pool'],
        'fitness center': 'fitness_leisure_centre',
        'gym': 'fitness_leisure_centre',
        'skate park': 'skate_park',
        'spray pad': 'spray_pad',
        'community center': 'community_centre',
        'indoor soccer': 'indoor_soccer',

    };

    return data.filter(item => {
        return Object.keys(item).some(key => {
            if (Array.isArray(manualMapping[amenity])) {
                return manualMapping[amenity].includes(key) && item[key];
            } else {
                return (key.toLowerCase().includes(amenity.toLowerCase()) || manualMapping[amenity] === key) && item[key];
            }
        });
    });
}

// Script to display the results retrieved using AJAX
function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = '';

    if (results.length === 0) {
        searchResultsDiv.textContent = 'No results found.';
    } else {
        // Create a container for each row
        for (let i = 0; i < results.length; i += 4) {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');

            // Create a row with up to four result containers
            for (let j = i; j < i + 4 && j < results.length; j++) {
                const item = results[j];
                const resultContainer = document.createElement('div');
                resultContainer.classList.add('result-container');

                const resultList = document.createElement('ul');

                // Display complex name
                const nameListItem = document.createElement('li');
                const nameSpan = document.createElement('h3');
                nameSpan.textContent = `Recreational Complex ${item.complex_name}`;
                nameListItem.appendChild(nameSpan);
                resultList.appendChild(nameListItem);

                // Display address
                const addressListItem = document.createElement('li');
                const addressSpan = document.createElement('h4');
                addressSpan.textContent = `Address: ${item.address}`;
                addressListItem.appendChild(addressSpan);
                resultList.appendChild(addressListItem);

                // Assign an icon and text to each API key dataType bolean which represent the amenities
                const booleanProperties = [
                    { key: 'community_centre', icon: 'fa-people-group', text: 'Community Centre' },
                    { key: 'skate_park', icon: 'fa-person-skating', text: 'Skate Park' },
                    { key: 'arena', icon: 'fa-ranking-star', text: 'Arena' },
                    { key: 'wading_pool', icon: 'fa-water-ladder', text: 'Wading Pool' },
                    { key: 'spray_pad', icon: 'fa-sun-plant-wilt', text: 'Spray Pad' },
                    { key: 'outdoor_pool', icon: 'fa-person-swimming', text: 'Outdoor Pool' },
                    { key: 'indoor_pool', icon: 'fa-water-ladder', text: 'Indoor Pool' },
                    { key: 'fitness_leisure_centre', icon: 'fa-dumbbell', text: 'Fitness Leisure Centre' },
                    { key: 'library', icon: 'fa-book', text: 'Library' },
                    { key: 'indoor_soccer', icon: 'fa-futbol', text: 'Indoor Soccer' }
                ];
                // Check and display the boolean properties set as true
                booleanProperties.forEach(property => {
                    if (item[property.key]) {
                        const propertyListItem = document.createElement('li');
                        const propertySpan = document.createElement('span');
                        propertySpan.textContent = ` ${property.text}`;
                        const icon = document.createElement('i');
                        icon.classList.add('fa-solid', property.icon);
                        propertySpan.prepend(icon);
                        propertyListItem.appendChild(propertySpan);
                        resultList.appendChild(propertyListItem);
                    }
                });

                resultContainer.appendChild(resultList);
                rowContainer.appendChild(resultContainer);
            }

            searchResultsDiv.appendChild(rowContainer);
        }
    }
}
