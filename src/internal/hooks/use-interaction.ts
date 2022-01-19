import { useEffect, useMemo, useState } from "react";
import { Interaction, OpenUrl } from "scribing";
import { useEditMode } from "../EditModeScope";
import { useFlowLocale } from "../../FlowLocaleScope";
import { useInteractionInvoker } from "./use-interaction-invoker";
import { useHover } from "./use-hover";
import { useCtrlKey, useShiftKey } from "./use-modifier-key";
import { useNativeEventHandler } from "./use-native-event-handler";
import { useResolvedLink } from "../LinkResolverScope";

/** @internal */
interface InteractionState {
    clickable: boolean;
    hover: boolean;
    pending: boolean;
    error: boolean;
    href: string;
    target: string;
    message: string | null;
}

/** @internal */
export function useInteraction(
    interaction: Interaction | null,
    rootElem: HTMLElement | null,
    sourceError: Error | null = null,
    disabled = false,
): InteractionState {
    const editMode = useEditMode();
    const hover = useHover(rootElem);
    const ctrlKey = useCtrlKey();
    const shiftKey = useShiftKey();
    const invokeAction = useInteractionInvoker(interaction);
    const resolvedLink = useResolvedLink(interaction instanceof OpenUrl ? interaction.url : "");
    const locale = useFlowLocale();
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(sourceError);
    const clickable = !!interaction && (!editMode || (hover && ctrlKey && !shiftKey));
    const message = useMemo(
        () => error ? (
            error.message
        ) : editMode && !clickable && interaction && !pending ? (
            locale.hold_ctrl_key_to_enable_interaction
        ) : null, 
        [!!editMode, clickable, locale, !!interaction, !pending, error]
    );
    const href = useMemo(() => {
        if (rootElem != null && rootElem.tagName.toUpperCase() === "A" && resolvedLink) {
            return resolvedLink.url;
        } else {
            return "";
        }
    }, [rootElem, resolvedLink]);
    const target = useMemo(() => {
        if (href && resolvedLink) {
            return resolvedLink.target;
        } else {
            return "";
        }
    }, [href, resolvedLink]);

    useNativeEventHandler(rootElem, "click", (e: MouseEvent) => {
        if (!clickable && editMode && e.detail === 4 && rootElem) {
            e.preventDefault();
            const domSelection = document.getSelection();
            if (domSelection && domSelection.rangeCount === 1) {
                domSelection.getRangeAt(0).selectNode(rootElem);
                e.stopPropagation();
            }    
        } else if (disabled) {
            e.preventDefault();
        } else if (clickable && !pending) {
            setError(sourceError);
            if (!href || editMode) {
                e.preventDefault();
                setPending(invokeAction());
            }
        } 
    }, [clickable, pending, invokeAction, editMode, rootElem, href, sourceError]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                await pending;
            } catch (error) {
                if (active) {
                    setError(error instanceof Error ? error : new Error("Interaction failed"));
                }
            }
            if (active) {
                setPending(null);
            }
        })();
        return () => { active = false; };
    }, [pending]);

    return {
        clickable,
        hover,
        pending: !!pending,
        error: !!error,
        href,
        target,
        message,
    };
}
