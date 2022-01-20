import { useMemo } from "react";
import { Interaction, OpenUrl, RunScript } from "scribing";
import { useScriptHost } from "scripthost-react";
import { resolveLink, useLinkResolver } from "../LinkResolverScope";
import { useScriptVariables } from "../ScriptVariablesScope";

/**
 * @public
 */
export function useInteractionInvoker(interaction: Interaction | null): () => Promise<void> {
    const host = useScriptHost();
    const linkResolver = useLinkResolver();
    const vars = useScriptVariables();
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
                await host.eval(interaction.script, { vars });
            };
        } else {
            return async () => {
                throw new Error("Unsupported interaction");
            };
        }
    }, [interaction, host, linkResolver]);
}
