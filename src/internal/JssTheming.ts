import { Classes } from "jss";
import { useMemo } from "react";
import { createUseStyles, Styles } from "react-jss";
import { FlowPalette } from "../FlowPalette";
import { useFlowPalette } from "../FlowPaletteScope";
import { makeJssId } from "./utils/make-jss-id";

/** @internal */
export interface JssFlowTheme {
    palette: FlowPalette;
}

/** @internal */
export function createUseFlowStyles<C extends string>(
    component: string,
    styles: (theme: JssFlowTheme) => Styles<C>,
): () => Classes<C> {
    const generateId = makeJssId(component);
    const useStyles = createUseStyles<C, unknown, JssFlowTheme>(styles, { generateId });
    return function useFlowStyles() {
        const palette = useFlowPalette();
        const theme = useMemo<JssFlowTheme>(() => ({ palette }), [palette]);
        return useStyles({ theme });
    };
}
