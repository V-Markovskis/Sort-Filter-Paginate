import axios from 'axios';
import $ from 'jquery';

//get elements part here
const countryInput = document.querySelector<HTMLInputElement>('.country-name');
const columnContainer = document.querySelector<HTMLElement>('js-column-container');
const searchButton = document.querySelector<HTMLButtonElement>('.search-button');
const formContainer = document.querySelector<HTMLFormElement>('.js-form-container');
const globalTable = document.querySelector<HTMLTableElement>('.js-global-table');
const tbodyTableElement = document.querySelector<HTMLTableElement>('.js-table-body');

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

loadFirstTwentyCountries();

function loadFirstTwentyCountries() {
    axios.get('http://localhost:3004/countries?_limit=20')
        .then(({ data }) => {
            data.forEach((country: Country, index: number) => {
                updateTable(country, index + 1);
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    }


searchButton.addEventListener('click', () => {
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
        loadFirstTwentyCountries();
    }
});

const loadCountryDB = (paramKey: keyof Country, activeInput: HTMLInputElement) => {
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

            filteredCountries.forEach((country, index) => {
                updateTable(country, index + 1);
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
 






//axios.get('http://localhost:3004/countries?_limit=20') CHECK!!!!