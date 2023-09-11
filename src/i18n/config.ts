import i18n from 'i18next';
import translationfr from './fr/translation.json';
import translationen from './en/translation.json';
import errorfr from './fr/error.json';
import successfr from './fr/success.json';
import commandsfr from './fr/commands.json';
import fddfr from './fr/fdd.json';

export const resources = {
    fr: {
        translation: {...translationfr, ...errorfr, ...successfr, ...commandsfr, ...fddfr}
    },
    en: {
        translation: translationen
    }
} as const;

i18n.init({
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    },
    resources
});