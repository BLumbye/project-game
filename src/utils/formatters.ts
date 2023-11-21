import config from '~/config';

export const currencyFormat = new Intl.NumberFormat(config.currency.region, {
    style: 'currency', currency: config.currency.currency
});