import { IFormGenerator } from "../components/form-generator/form-generator.interface";

export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function generateFormFieldsFromObject(object: any, exclude: string[] = []): IFormGenerator[] {
  const keys = extractKeys(object, exclude);
  const fields: IFormGenerator[] = [];
  keys.forEach(key => {
    fields.push({
      label: getLabelFromKey(key),
      name: key,
      hint: "",
      options: [],
      type: guessInputType(key),
      value: object[key],
      required: false,
      api_url: "",
      apiKeyProperty: "",
      apiLabelProperty: "",
    });
  });
  return fields;
}

export function extractKeys(object: any, exclude: any[]) {
  const keys = [];
  for (const key in object) {
    if (exclude.indexOf(key) == -1) {
      keys.push(key);
    }

  }
  return keys;
}

/**
 * get the label text. replace underscores with spaces and capitalise
 * @param key any string
 * @returns string
 */
export function getLabelFromKey(key: string, capitalise?: boolean) {
  let fullName = replace_underscore(key, ' ');
  return capitalise ? fullName.toUpperCase() : fullName.charAt(0).toUpperCase() + fullName.split('').slice(1).join('');
}


/**
 * Replace all occurrences of underscore in a given string with a given substring
 * @param str The string to replace the underscore in
 * @param sub The substring to replace the underscore with
 * @returns The string with all occurrences of underscore replaced
 */
export function replace_underscore(str: string, sub: string): string {
  return str.replace(/_/g, sub);
}


/**
 * Determines the input type based on the provided field name.
 * Analyzes the name to identify common patterns and returns a
 * corresponding input type string.
 *
 * @param name - The field name to analyze.
 * @returns A string representing the input type, such as 'textarea',
 * 'text', 'picture', 'date', 'file', 'email', 'password', 'tel', 'url',
 * or 'number'. Defaults to 'text' if no specific type is determined.
 */

export function guessInputType(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('description')) {
    return 'textarea';
  }
  if (lowerName.includes('registration_number') || lowerName.includes('id_number') || lowerName.includes('license_number')) {
    return 'text';
  }

  if (lowerName.includes('picture') || lowerName.includes('photo') || lowerName.includes('image')) {
    return 'picture';
  }

  if (lowerName.includes('date') || lowerName.endsWith('_at') || lowerName.endsWith('_on')) {
    return 'date';
  }

  if (lowerName.includes('file') || lowerName.includes('attachment') || lowerName.includes('document')) {
    return 'file';
  }

  if (lowerName.includes('email')) {
    return 'email';
  }

  if (lowerName.includes('password')) {
    return 'password';
  }

  if (lowerName.includes('phone') || lowerName.includes('mobile')) {
    return 'tel';
  }

  if (lowerName.includes('url') || lowerName.includes('website') || lowerName.includes('link')) {
    return 'url';
  }

  if (lowerName.includes('number') || lowerName.includes('amount') || lowerName.includes('quantity')) {
    return 'number';
  }

  // Default to text for any other cases
  return 'text';
}

export function replaceSpaceWithUnderscore(str: string | null, stringifyNull: boolean = true): string {
  if (!str) {
    return stringifyNull ? "null" : "";
  }
  return typeof str === 'string' ? str.replace(/ /g, '_') : "";
}

export function openHtmlInNewWindow(htmlContent: string): void {
  // Create a Blob containing the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Open a new window with the URL
  window.open(url, '_blank');
}


export const countryListAlpha2: { [key: string]: string } = {
  "AF": "Afghanistan",
  "AL": "Albania",
  "DZ": "Algeria",
  "AS": "American Samoa",
  "AD": "Andorra",
  "AO": "Angola",
  "AI": "Anguilla",
  "AQ": "Antarctica",
  "AG": "Antigua and Barbuda",
  "AR": "Argentina",
  "AM": "Armenia",
  "AW": "Aruba",
  "AU": "Australia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BS": "Bahamas (the)",
  "BH": "Bahrain",
  "BD": "Bangladesh",
  "BB": "Barbados",
  "BY": "Belarus",
  "BE": "Belgium",
  "BZ": "Belize",
  "BJ": "Benin",
  "BM": "Bermuda",
  "BT": "Bhutan",
  "BO": "Bolivia (Plurinational State of)",
  "BQ": "Bonaire, Sint Eustatius and Saba",
  "BA": "Bosnia and Herzegovina",
  "BW": "Botswana",
  "BV": "Bouvet Island",
  "BR": "Brazil",
  "IO": "British Indian Ocean Territory (the)",
  "BN": "Brunei Darussalam",
  "BG": "Bulgaria",
  "BF": "Burkina Faso",
  "BI": "Burundi",
  "CV": "Cabo Verde",
  "KH": "Cambodia",
  "CM": "Cameroon",
  "CA": "Canada",
  "KY": "Cayman Islands (the)",
  "CF": "Central African Republic (the)",
  "TD": "Chad",
  "CL": "Chile",
  "CN": "China",
  "CX": "Christmas Island",
  "CC": "Cocos (Keeling) Islands (the)",
  "CO": "Colombia",
  "KM": "Comoros (the)",
  "CD": "Congo (the Democratic Republic of the)",
  "CG": "Congo (the)",
  "CK": "Cook Islands (the)",
  "CR": "Costa Rica",
  "HR": "Croatia",
  "CU": "Cuba",
  "CW": "Curaçao",
  "CY": "Cyprus",
  "CZ": "Czechia",
  "CI": "Côte d'Ivoire",
  "DK": "Denmark",
  "DJ": "Djibouti",
  "DM": "Dominica",
  "DO": "Dominican Republic (the)",
  "EC": "Ecuador",
  "EG": "Egypt",
  "SV": "El Salvador",
  "GQ": "Equatorial Guinea",
  "ER": "Eritrea",
  "EE": "Estonia",
  "SZ": "Eswatini",
  "ET": "Ethiopia",
  "FK": "Falkland Islands (the) [Malvinas]",
  "FO": "Faroe Islands (the)",
  "FJ": "Fiji",
  "FI": "Finland",
  "FR": "France",
  "GF": "French Guiana",
  "PF": "French Polynesia",
  "TF": "French Southern Territories (the)",
  "GA": "Gabon",
  "GM": "Gambia (the)",
  "GE": "Georgia",
  "DE": "Germany",
  "GH": "Ghana",
  "GI": "Gibraltar",
  "GR": "Greece",
  "GL": "Greenland",
  "GD": "Grenada",
  "GP": "Guadeloupe",
  "GU": "Guam",
  "GT": "Guatemala",
  "GG": "Guernsey",
  "GN": "Guinea",
  "GW": "Guinea-Bissau",
  "GY": "Guyana",
  "HT": "Haiti",
  "HM": "Heard Island and McDonald Islands",
  "VA": "Holy See (the)",
  "HN": "Honduras",
  "HK": "Hong Kong",
  "HU": "Hungary",
  "IS": "Iceland",
  "IN": "India",
  "ID": "Indonesia",
  "IR": "Iran (Islamic Republic of)",
  "IQ": "Iraq",
  "IE": "Ireland",
  "IM": "Isle of Man",
  "IL": "Israel",
  "IT": "Italy",
  "JM": "Jamaica",
  "JP": "Japan",
  "JE": "Jersey",
  "JO": "Jordan",
  "KZ": "Kazakhstan",
  "KE": "Kenya",
  "KI": "Kiribati",
  "KP": "Korea (the Democratic People's Republic of)",
  "KR": "Korea (the Republic of)",
  "KW": "Kuwait",
  "KG": "Kyrgyzstan",
  "LA": "Lao People's Democratic Republic (the)",
  "LV": "Latvia",
  "LB": "Lebanon",
  "LS": "Lesotho",
  "LR": "Liberia",
  "LY": "Libya",
  "LI": "Liechtenstein",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "MO": "Macao",
  "MG": "Madagascar",
  "MW": "Malawi",
  "MY": "Malaysia",
  "MV": "Maldives",
  "ML": "Mali",
  "MT": "Malta",
  "MH": "Marshall Islands (the)",
  "MQ": "Martinique",
  "MR": "Mauritania",
  "MU": "Mauritius",
  "YT": "Mayotte",
  "MX": "Mexico",
  "FM": "Micronesia (Federated States of)",
  "MD": "Moldova (the Republic of)",
  "MC": "Monaco",
  "MN": "Mongolia",
  "ME": "Montenegro",
  "MS": "Montserrat",
  "MA": "Morocco",
  "MZ": "Mozambique",
  "MM": "Myanmar",
  "NA": "Namibia",
  "NR": "Nauru",
  "NP": "Nepal",
  "NL": "Netherlands (the)",
  "NC": "New Caledonia",
  "NZ": "New Zealand",
  "NI": "Nicaragua",
  "NE": "Niger (the)",
  "NG": "Nigeria",
  "NU": "Niue",
  "NF": "Norfolk Island",
  "MP": "Northern Mariana Islands (the)",
  "NO": "Norway",
  "OM": "Oman",
  "PK": "Pakistan",
  "PW": "Palau",
  "PS": "Palestine, State of",
  "PA": "Panama",
  "PG": "Papua New Guinea",
  "PY": "Paraguay",
  "PE": "Peru",
  "PH": "Philippines (the)",
  "PN": "Pitcairn",
  "PL": "Poland",
  "PT": "Portugal",
  "PR": "Puerto Rico",
  "QA": "Qatar",
  "MK": "Republic of North Macedonia",
  "RO": "Romania",
  "RU": "Russian Federation (the)",
  "RW": "Rwanda",
  "RE": "Réunion",
  "BL": "Saint Barthélemy",
  "SH": "Saint Helena, Ascension and Tristan da Cunha",
  "KN": "Saint Kitts and Nevis",
  "LC": "Saint Lucia",
  "MF": "Saint Martin (French part)",
  "PM": "Saint Pierre and Miquelon",
  "VC": "Saint Vincent and the Grenadines",
  "WS": "Samoa",
  "SM": "San Marino",
  "ST": "Sao Tome and Principe",
  "SA": "Saudi Arabia",
  "SN": "Senegal",
  "RS": "Serbia",
  "SC": "Seychelles",
  "SL": "Sierra Leone",
  "SG": "Singapore",
  "SX": "Sint Maarten (Dutch part)",
  "SK": "Slovakia",
  "SI": "Slovenia",
  "SB": "Solomon Islands",
  "SO": "Somalia",
  "ZA": "South Africa",
  "GS": "South Georgia and the South Sandwich Islands",
  "SS": "South Sudan",
  "ES": "Spain",
  "LK": "Sri Lanka",
  "SD": "Sudan (the)",
  "SR": "Suriname",
  "SJ": "Svalbard and Jan Mayen",
  "SE": "Sweden",
  "CH": "Switzerland",
  "SY": "Syrian Arab Republic",
  "TW": "Taiwan",
  "TJ": "Tajikistan",
  "TZ": "Tanzania, United Republic of",
  "TH": "Thailand",
  "TL": "Timor-Leste",
  "TG": "Togo",
  "TK": "Tokelau",
  "TO": "Tonga",
  "TT": "Trinidad and Tobago",
  "TN": "Tunisia",
  "TR": "Turkey",
  "TM": "Turkmenistan",
  "TC": "Turks and Caicos Islands (the)",
  "TV": "Tuvalu",
  "UG": "Uganda",
  "UA": "Ukraine",
  "AE": "United Arab Emirates (the)",
  "GB": "United Kingdom of Great Britain and Northern Ireland (the)",
  "UM": "United States Minor Outlying Islands (the)",
  "US": "United States of America (the)",
  "UY": "Uruguay",
  "UZ": "Uzbekistan",
  "VU": "Vanuatu",
  "VE": "Venezuela (Bolivarian Republic of)",
  "VN": "Viet Nam",
  "VG": "Virgin Islands (British)",
  "VI": "Virgin Islands (U.S.)",
  "WF": "Wallis and Futuna",
  "EH": "Western Sahara",
  "YE": "Yemen",
  "ZM": "Zambia",
  "ZW": "Zimbabwe",
  "AX": "Åland Islands"
};

export function getCountryCode(country: string): string | undefined {
  return Object.keys(countryListAlpha2).find(key => countryListAlpha2[key].toLowerCase() === country.toLowerCase());
}

export function openPrintWindow(htmlContent: string): void {

  const documentContent = `
          <html>
            <head>
              <title>Print </title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous">
              <style>
              .page-break{
                page-break-before: always;
            }
            body{
              line-height: 1 !important;
            }


@media print {
  .no-print {
      display: none;
      width: 0px !important;
  }
      .page-break{
                page-break-before: always;
            }

}



            </style>
            </head>
        <body >
        <div class='no-print'>
        Press Ctrl+P or click this button
        <button id='print_btn' class='btn btn-primary no-print'>Print</button> to print
        <hr>
        </div>
        ${htmlContent}
        <script
  src="https://code.jquery.com/jquery-3.6.0.min.js"
  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
  crossorigin="anonymous"></script>
        <script>
        $(document).ready(function () {
          $(document).on("click", "#print_btn", function () {
            window.print()
        });


        });
        flexFont = function () {
          const divs = document.getElementsByClassName("flexFont");
          for(let i = 0; i < divs.length; i++) {
              let relFontsize = divs[i].offsetWidth*0.05;
              divs[i].style.fontSize = relFontsize+'px';
          }
      };
      window.onafterprint = function(){
            window.close();
          }

      window.onload = function(event) {
          flexFont();
      };
      window.onresize = function(event) {
          flexFont();
      };
           </script>

           </body>
          </html>`;
  const blob = new Blob([documentContent], { type: 'text/html' });
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Open a new window with the URL
  window.open(url, '_blank');


}
