import { useEffect, useMemo, useState } from "react";
import { Interaction, OpenUrl } from "scribing";
import { useEditMode } from "../../EditModeScope";
import { useFlowLocale } from "../../FlowLocaleScope";
import { useInteractionInvoker } from "../../useInteractionInvoker";
import { useShowTip } from "../TooltipScope";
import { useHover } from "./use-hover";
import { useCtrlKey } from "./use-modifier-key";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
interface InteractionState {
    clickable: boolean;
    hover: boolean;
    pending: boolean;
    error: boolean;
    href: string;
}

/** @internal */
export function useInteraction(interaction: Interaction | null, rootElem: HTMLElement | null): InteractionState {
    const editMode = useEditMode();
    const hover = useHover(rootElem);
    const ctrlKey = useCtrlKey();
    const invokeAction = useInteractionInvoker(interaction);
    const showTip = useShowTip();
    const locale = useFlowLocale();
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const clickable = !!interaction && (!editMode || (hover && ctrlKey));
    const message = useMemo(
        () => error ? (
            error.message
        ) : editMode && !clickable && interaction && !pending ? (
            locale.hold_ctrl_key_to_enable_interaction
        ) : null, 
        [!!editMode, clickable, locale, !!interaction, !pending, error]
    );
    const href = useMemo(() => {
        if (rootElem != null && rootElem.tagName.toUpperCase() === "A" && interaction instanceof OpenUrl) {
            return interaction.url;
        } else {
            return "";
        }
    }, [rootElem, interaction]);

    useNativeEventHandler(rootElem, "click", (e: MouseEvent) => {        
        if (clickable && !pending) {
            setError(null);
            if (!href || editMode) {
                e.preventDefault();
                setPending(invokeAction());
            }
        } else if (!clickable && editMode && e.detail === 4 && rootElem) {
            e.preventDefault();
            const domSelection = document.getSelection();
            if (domSelection && domSelection.rangeCount === 1) {
                domSelection.getRangeAt(0).selectNode(rootElem);
                e.stopPropagation();
            }    
        }
    }, [clickable, pending, invokeAction, editMode, rootElem, href]);

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

    useEffect(() => {
        if (rootElem && hover && message) {
            let hideTip: (() => void) | undefined;
            const timer = setTimeout(() => hideTip = showTip(rootElem, message), 500);
            return () => {
                clearTimeout(timer);
                if (hideTip) {
                    hideTip();
                }
            };
        }
    }, [rootElem, hover, message, showTip]);

    return {
        clickable,
        hover,
        pending: !!pending,
        error: !!error,
        href,
    };
}
