import { useMemo } from "react";
import { Interaction, OpenUrl, RunScript } from "scribing";
import { useScriptHost } from "scripthost-react";
import { resolveLink, useLinkResolver } from "../LinkResolverScope";

/**
 * @public
 */
export function useInteractionInvoker(interaction: Interaction | null): () => Promise<void> {
    const host = useScriptHost();
    const linkResolver = useLinkResolver();
    return useMemo(() => {
        if (interaction === null) {
            return async () => { /* no-op */ };
        } else if (interaction instanceof OpenUrl) {
            return async () => {
                const resolvedLink = await resolveLink(interaction.url, linkResolver);                
                window.open(resolvedLink.url, resolvedLink.target);
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
    }, [interaction, host, linkResolver]);
}
