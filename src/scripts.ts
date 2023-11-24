import axios from 'axios';
import $ from 'jquery';

//get elements part here
const countryInput = document.querySelector<HTMLInputElement>('.country-name');
const columnContainer = document.querySelector<HTMLElement>('js-column-container');
const searchButton = document.querySelector<HTMLButtonElement>('.search-button');

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

const countryElement = document.querySelector('.row-one');
console.log(countryElement);

const loadCountryDB = () => {
    const result = axios.get<Country[]>('http://localhost:3004/countries');
    let db: { countries: Country[] };

    result.then(({ data }) => {
        db = { countries: data };
        console.log(db);
        searchButton.addEventListener('click', () => {
            //get value from input field
            const searchCountry = countryInput.value.toLowerCase();
           
            //filter countries by entered country
            const filteredCountries = db.countries.filter((country) => country.name.toLowerCase().includes(searchCountry));
            console.log('Filtered country', filteredCountries);
    
            //clear field all td elements text
            const firstRowTds = document.querySelectorAll('.row-one td');
            console.log('firstRowTds', firstRowTds);
            firstRowTds.forEach((td) => {
                td.textContent = '';
            });
            
            if (countryElement) {
                if (filteredCountries.length > 0) {
                    const firstCountry = filteredCountries[0];
                    console.log('firstCountry', firstCountry);
                    firstRowTds[0].textContent = firstCountry.name;
                    firstRowTds[1].textContent = firstCountry.capital;
                    firstRowTds[2].textContent = firstCountry.currency.code;
                    firstRowTds[3].textContent = firstCountry.language.code;
                }
            }
        });
    }).catch((error) => {
        console.error('Error loading database:', error);
    });
};

loadCountryDB();

