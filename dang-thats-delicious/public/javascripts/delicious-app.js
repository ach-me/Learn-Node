// Punto de entrada para todo el javascript

import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autocomplete from './modules/autocomplete';

autocomplete($('#address'), $('#lat'), $('#lng'));
