import { useCallback, useMemo } from "react";
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
    const outerVars = useScriptVariables();
    const vars = useMemo(() => interaction instanceof RunScript ? ({
        ...outerVars,
        ...Object.fromEntries(interaction.script.messages.entries()),
    }) : outerVars, [outerVars, interaction]);
    return useCallback(async () => {
        if (interaction instanceof OpenUrl) {
            const resolvedLink = await resolveLink(interaction.url, linkResolver);
            window.open(resolvedLink.url, resolvedLink.target);
        } else if (interaction instanceof RunScript) {
            await host.eval(interaction.script.code, { vars });
        } else if (interaction !== null) {
            throw new Error("Unsupported interaction");
        }
    }, [interaction, host, linkResolver, vars]);
}
