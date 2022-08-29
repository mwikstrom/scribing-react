import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Interaction, OpenUrl } from "scribing";
import { useEditMode } from "../EditModeScope";
import { useFlowLocale } from "../../FlowLocaleScope";
import { useInteractionInvoker } from "./use-interaction-invoker";
import { useHover } from "./use-hover";
import { useCtrlKey, useShiftKey } from "./use-modifier-key";
import { useNativeEventHandler } from "./use-native-event-handler";
import { resolvedLinkRequiresHtml5History, useResolvedLink } from "../LinkResolverScope";
import { ScriptEvalScope } from "./use-script-eval-props";
import { useInteractionLogger } from "../../InteractionLoggerScope";
import { useApplicationErrorRenderer } from "../../ApplicationErrorRenderScope";

/** @internal */
interface InteractionState {
    clickable: boolean;
    hover: boolean;
    pending: boolean;
    error: boolean;
    href: string;
    target: string;
    message: ReactNode;
}

/** @internal */
export function useInteraction(
    interaction: Interaction | null,
    rootElem: HTMLElement | null,
    evalScope: Omit<ScriptEvalScope, "script">,
    sourceError: Error | null = null,
    disabled = false,
): InteractionState {
    const editMode = useEditMode();
    const hover = useHover(rootElem);
    const ctrlKey = useCtrlKey();
    const shiftKey = useShiftKey();
    const invokeAction = useInteractionInvoker(interaction, evalScope);
    const resolvedLink = useResolvedLink(interaction instanceof OpenUrl ? interaction.url : "");
    const locale = useFlowLocale();
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(sourceError);
    const clickable = !!interaction && (!editMode || (hover && ctrlKey && !shiftKey));
    
    const renderErrorInfo = useApplicationErrorRenderer();
    const message = useMemo(() => {
        if (error) {
            if (renderErrorInfo) {
                return renderErrorInfo(error);
            } else {
                return error.message;
            }            
        } else if (editMode && !clickable && interaction && !pending) {
            return locale.hold_ctrl_key_to_enable_interaction;
        } else {
            return null;
        }
    }, [!!editMode, clickable, locale, !!interaction, !pending, error, renderErrorInfo]);
    
    const href = useMemo(() => {
        if (isAnchorElem(rootElem) && resolvedLink) {
            return resolvedLink.url;
        } else {
            return "";
        }
    }, [rootElem, resolvedLink]);
    const useHtml5History = resolvedLinkRequiresHtml5History(resolvedLink);
    const target = useMemo(() => {
        if (href && resolvedLink) {
            return resolvedLink.target;
        } else {
            return "";
        }
    }, [href, resolvedLink]);
    const logger = useInteractionLogger();
    
    const textRef = useRef("");
    const getElementText = useCallback(() => {
        if (rootElem) {
            const extracted = rootElem.innerText.replace(/\s+/g, " ").trim();
            if (extracted) {
                textRef.current = extracted;
            }
        }
        return textRef.current;
    }, [rootElem]);

    const [loggedDisabled, setLoggedDisabled] = useState(false);
    useEffect(() => {
        if (logger && loggedDisabled !== disabled) {
            logger.log(`${disabled ? "Disabled" : "Enabled"} interaction element "${getElementText()}"`);            
        }
        setLoggedDisabled(disabled);
    }, [logger, disabled, loggedDisabled, getElementText, setLoggedDisabled]);

    const [loggedError, setLoggedError] = useState("");
    useEffect(() => {
        const errorMessage = error?.message || "";
        if (logger && loggedError !== errorMessage) {
            if (errorMessage) {
                logger.error(`Interaction element "${getElementText()}" failed:`, errorMessage);
            } else {
                logger.log(`Error cleared from interaction element "${getElementText()}"`);
            }
        }
        setLoggedError(errorMessage);
    }, [logger, error, loggedError, getElementText, setLoggedError]);

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

            if (logger) {
                logger.log(`Click on interaction element "${getElementText()}"`);
            }

            if (useHtml5History || !href || !isAnchorElem(rootElem) || rootElem.href !== href || editMode) {
                e.preventDefault();
                setPending(invokeAction());
            }
        } 
    }, [
        clickable,
        pending,
        disabled,
        invokeAction,
        editMode,
        rootElem,
        useHtml5History,
        href,
        sourceError,
        logger,
        getElementText
    ]);

    useEffect(() => {
        if (!pending) {
            return;
        }
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

function isAnchorElem(elem: HTMLElement | null): elem is HTMLAnchorElement {
    return !!elem && elem.tagName.toUpperCase() === "A";
}