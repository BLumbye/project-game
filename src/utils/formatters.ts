import config from '~/config';

export const currencyFormat = new Intl.NumberFormat(config.currency.region, {
    style: 'currency', currency: config.currency.currency
});

export const capitalize = (input: string): string => {
    return input.charAt(0).toUpperCase() + input.slice(1);
};