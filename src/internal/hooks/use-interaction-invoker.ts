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
            const { action, url, target, state } = await resolveLink(interaction.url, linkResolver);

            if (action !== "open" && target !== "_self") {
                console.warn(`The specified target "${target}" is ignored when link action is not "open"`);
            }

            if (action === "push") {
                history.pushState(state, "", url);
            } else if (action === "replace") {
                history.replaceState(state, "", url);
            } else if (action === "open") {
                if (state !== undefined) {
                    console.warn("The specified state is ignored when link action is \"open\"");
                }
                window.open(url, target);
            } else {
                throw new Error(`Unsupported link action: ${action}`);
            }
        } else if (interaction instanceof RunScript) {
            await host.eval(interaction.script.code, evalProps);
        } else if (interaction !== null) {
            throw new Error("Unsupported interaction");
        }
    }, [interaction, host, linkResolver, evalProps]);
}
