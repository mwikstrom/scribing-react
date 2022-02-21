import { IntlMessageFormat } from "intl-messageformat";
import { Script } from "scribing";

/**
 * @public
 */
export interface FormatMessageOptions {
    lang?: string;
}

/**
 * @public
 */
export function formatMessage(
    message: string,
    vars: Record<string, unknown>,
    options: FormatMessageOptions = {}
): string {
    try {
        if (!Script.isSupportedMessageFormat(message)) {
            return message;
        }
        const { lang } = options;
        const locales = ["en-US"]; // en-US is used as a fallback/invariant locale
        if (lang) {
            locales.unshift(lang);
        }
        const formatter = new IntlMessageFormat(message, locales);
        const result = formatter.format(vars);
        return Array.isArray(result) ? result.map(String).join("") : String(result);
    } catch {
        return message;
    }    
}
