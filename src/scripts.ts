import axios from 'axios';
import $ from 'jquery';

//get elements part here
const searchButton = document.querySelector<HTMLButtonElement>('.search-button');
const formContainer = document.querySelector<HTMLFormElement>('.js-form-container');
const tbodyTableElement = document.querySelector<HTMLTableElement>('.js-table-body');
const loadMoreButton = document.querySelector<HTMLButtonElement>('.load-more');
const globalTable = document.querySelector<HTMLTableElement>('.js-global-table');

let isFiltered = false; //check if filter applied to countries

//create type for each country
type Country = {
    name: string;
    code: string;
    capital: string;
    region: string;
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    language: {
        code: string;
        name: string;
    };
    flag: string;
    dialing_code: string;
    isoCode: string;
};

let indexOffset = 0;
loadTwentyCountries();


function loadTwentyCountries() { 
    axios.get(`http://localhost:3004/countries?_start=${indexOffset}&_limit=20`)
        .then(({ data }) => {
            // tbodyTableElement.innerHTML = '';
            data.forEach((country: Country, index: number) => {
                updateTable(country, indexOffset + index + 1);
                console.log('index after inserting 20 countries', indexOffset);
            });
            indexOffset += 20;
            console.log('increment index plus 20', indexOffset);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });      
}

loadMoreButton.addEventListener('click', () => {
    if (isFiltered) {
        tbodyTableElement.innerHTML = '';
        isFiltered = false;
    }
    loadTwentyCountries();
});


searchButton.addEventListener('click', () => {
    indexOffset = 0;
    tbodyTableElement.innerHTML = '';
    const inputs = formContainer.querySelectorAll<HTMLInputElement>('input');
    const activeInput = Array.from(inputs).find((input) => input.value.trim() !== '');

    if (activeInput) {
        let category: keyof Country | undefined;

        const inputName = activeInput.getAttribute('name');

        switch (inputName) {
            case 'country-name':
                category = 'name';
                break;
            case 'capital-name':
                category = 'capital';
                break;
            case 'currency-name':
                category = 'currency';
                break;
            case 'language-name':
                category = 'language';
                break;
            default:
                console.log('switch case error');
                break;
        }

        if (category) {
            loadCountryDB(category, activeInput);
        }
    } else {
        console.log('Loading first twenty countries');
        loadTwentyCountries();
    }
});

const loadCountryDB = (paramKey: keyof Country, activeInput: HTMLInputElement) => {
    isFiltered = true;
    const result = axios.get<Country[]>('http://localhost:3004/countries');
    let db: { countries: Country[] };

    result.then(({ data }) => {
        db = { countries: data };
        console.log(db);
            //get value from input field
            const searchCountry = activeInput.value.toLowerCase();
            console.log('searchCountry:', searchCountry);
           
            //filter countries by entered country
            const filteredCountries = db.countries.filter((country) => {
                const fieldValue = country[paramKey]; //exp. same for country.name
            
                if (typeof fieldValue === 'object' && fieldValue !== null && 'name' in fieldValue) {
                  return fieldValue.name.toLowerCase().includes(searchCountry);
                }
            
                if (typeof fieldValue === 'string') {
                  return fieldValue.toLowerCase().includes(searchCountry);
                }
                return false;

            });
            console.log('Filtered country', filteredCountries);

            tbodyTableElement.innerHTML = '';

            filteredCountries.forEach((country, index) => {
                updateTable(country, indexOffset + index + 1);
            });
            
            activeInput.value = '';

        }).catch((error) => {
        console.error('Error loading database:', error);
    });
};


function updateTable(country: Country, rowIndex: number) {
    // <tr> element defines a row of cells in a table
    const row = document.createElement('tr');

    //create row numeration element
    const th = document.createElement('th');
    th.textContent = rowIndex.toString();
    row.appendChild(th);
    
    //create a cell for each country property
    const properties = ['name', 'capital', 'currency.name', 'language.name'];
    properties.forEach((property) => {
        const ceil = document.createElement('td');
        //passing whole object country to the function
        ceil.textContent = getProperty(country, property);
        row.appendChild(ceil);
    });

    //add cell to table
    tbodyTableElement.appendChild(row);    
}

//funсtion to get values from Country (such as currency and language)
function getProperty(obj: any, properties: string): string {
    const propChain = properties.split('.');
    let value = obj;

    propChain.forEach((property) => {
        //assign whole object country (aka value) to the property chain element (only single property per loop)
        value = value[property];
    });

    //return property text
    return value;
}

//SORT LOGIC JSON

const columns = document.querySelectorAll<HTMLTableElement>('.js-col');

 columns.forEach((column) => {
    column.addEventListener('click', () => {
        console.log('Column clicked:', column);
        const dataKey = column.getAttribute('data-key');
        console.log(dataKey);

        if (dataKey) {
            const url = `http://localhost:3004/countries?_sort=${dataKey}&_order=asc&_limit=${indexOffset}`;

            sortTable(url);
        }
    });
 });

 function sortTable(url: string) {
    axios.get(url)
        .then((response) => {
            // (response.data) this is the body, which contains the actual data returned by the server
            renderTable(response.data);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
 }

 function renderTable(data: Country[]) {
    
    tbodyTableElement.innerHTML = '';

    data.forEach((item, index) => {
        //table row
        const newRow = document.createElement('tr');

        //create row numeration element
        const th = document.createElement('th');
        th.textContent = indexOffset.toString();
        newRow.appendChild(th);

        newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.capital}</td>
            <td>${item.currency.name}</td>
            <td>${item.language.name}</td>
            `;
        tbodyTableElement.appendChild(newRow);
    });
 }
