import axios from 'axios';
import $ from 'jquery';

//get elements part here
const countryInput = document.querySelector<HTMLInputElement>('.country-name');
const columnContainer = document.querySelector<HTMLElement>('js-column-container');
const searchButton = document.querySelector<HTMLButtonElement>('.search-button');
const formContainer = document.querySelector<HTMLFormElement>('.js-form-container');

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


searchButton.addEventListener('click', () => {
    const inputs = formContainer.querySelectorAll<HTMLInputElement>('input');
    const activeInput = Array.from(inputs).find((input) => input.value.trim() !== '');

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
});

const countryElement = document.querySelector('.row-one');


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
    
            //clear field all td elements text
            const firstRowTds = document.querySelectorAll('.row-one td');
            console.log('firstRowTds', firstRowTds);
            firstRowTds.forEach((td) => {
                td.textContent = '';
            });

            activeInput.value = '';
            
            if (countryElement) {
                if (filteredCountries.length > 0) {
                    const firstCountry = filteredCountries[0];
                    console.log('firstCountry', firstCountry);
                    firstRowTds[0].textContent = firstCountry.name;
                    firstRowTds[1].textContent = firstCountry.capital;
                    firstRowTds[2].textContent = firstCountry.currency.name;
                    firstRowTds[3].textContent = firstCountry.language.name;
                }
            }
        }).catch((error) => {
        console.error('Error loading database:', error);
    });
};

