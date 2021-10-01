import { useMemo } from "react";
import { Interaction, OpenUrl, RunScript } from "scribing";
import { useScriptHost } from "scripthost-react";

/**
 * @public
 */
export function useInteractionInvoker(interaction: Interaction | null): () => void | Promise<void> {
    const host = useScriptHost();
    return useMemo(() => {
        if (interaction === null) {
            return () => { /* no-op */ };
        } else if (interaction instanceof OpenUrl) {
            return () => {
                window.open(interaction.url, "_blank");
            };
        } else if (interaction instanceof RunScript) {
            return async () => {
                await host.eval(interaction.script);
            };
        } else {
            return () => {
                throw new Error("Unsupported interaction");
            };
        }
    }, [interaction, host]);
}
