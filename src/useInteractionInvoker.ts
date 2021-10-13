import { useMemo } from "react";
import { Interaction, OpenUrl, RunScript } from "scribing";
import { useScriptHost } from "scripthost-react";

/**
 * @public
 */
export function useInteractionInvoker(interaction: Interaction | null): () => Promise<void> {
    const host = useScriptHost();
    return useMemo(() => {
        if (interaction === null) {
            return async () => { /* no-op */ };
        } else if (interaction instanceof OpenUrl) {
            return async () => {
                window.open(interaction.url, "_blank");
            };
        } else if (interaction instanceof RunScript) {
            return async () => {
                await host.eval(interaction.script);
            };
        } else {
            return async () => {
                throw new Error("Unsupported interaction");
            };
        }
    }, [interaction, host]);
}
