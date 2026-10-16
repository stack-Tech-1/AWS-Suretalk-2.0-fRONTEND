import { es } from 'date-fns/locale';

// date-fns locale for the UI language (undefined = date-fns default, English)
export const getDateFnsLocale = (lang) => (lang === 'es' ? es : undefined);

// Date + time pattern for date-fns `format` per UI language
export const dateTimePattern = (lang) => (lang === 'es' ? "d MMM yyyy • HH:mm" : 'MMM d, yyyy • h:mm a');
