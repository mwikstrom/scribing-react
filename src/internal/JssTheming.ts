import { Classes } from "jss";
import { useMemo } from "react";
import { createUseStyles, Styles } from "react-jss";
import { FlowPalette } from "./FlowPalette";
import { useFlowPalette } from "./FlowPaletteScope";
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
    return useFlowStyles.bind(useStyles);
}

function useFlowStyles<C extends string>(this: (data: {theme: JssFlowTheme}) => Classes<C>) {
    const palette = useFlowPalette();
    const theme = useMemo(() => getTheme(palette), [palette]);
    return this({ theme });
}

const themeByPalette = new WeakMap<FlowPalette, JssFlowTheme>();
const getTheme = (palette: FlowPalette): JssFlowTheme => {
    let theme = themeByPalette.get(palette);
    if (!theme) {
        themeByPalette.set(palette, theme = Object.freeze({ palette }));
    }
    return theme;
};
