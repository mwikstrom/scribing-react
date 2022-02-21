import { useCallback } from "react";
import { Interaction, OpenUrl, RunScript } from "scribing";
import { useScriptHost } from "scripthost-react";
import { resolveLink, useLinkResolver } from "../LinkResolverScope";
import { ScriptEvalScope, useScriptEvalProps } from "./use-script-eval-props";

/**
 * @public
 */
export function useInteractionInvoker(
    interaction: Interaction | null,
    evalScope: Omit<ScriptEvalScope, "script">,
): () => Promise<void> {
    const host = useScriptHost();
    const linkResolver = useLinkResolver();
    const evalProps = useScriptEvalProps({
        script: interaction instanceof RunScript ? interaction.script : null,
        ...evalScope,
    });
    return useCallback(async () => {
        if (interaction instanceof OpenUrl) {
            const resolvedLink = await resolveLink(interaction.url, linkResolver);
            window.open(resolvedLink.url, resolvedLink.target);
        } else if (interaction instanceof RunScript) {
            await host.eval(interaction.script.code, evalProps);
        } else if (interaction !== null) {
            throw new Error("Unsupported interaction");
        }
    }, [interaction, host, linkResolver, evalProps]);
}
