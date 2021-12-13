import { Classes } from "jss";
import { useMemo } from "react";
import { createUseStyles, Styles } from "react-jss";
import { FlowPalette } from "../FlowPalette";
import { useFlowPalette } from "../FlowPaletteScope";
import { FlowTypography } from "../FlowTypography";
import { useFlowTypography } from "../FlowTypographyScope";
import { makeJssId } from "./utils/make-jss-id";

/** @internal */
export interface JssFlowTheme {
    palette: FlowPalette;
    typography: FlowTypography;
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
    const typography = useFlowTypography();
    const theme = useMemo(() => getTheme(palette, typography), [palette]);
    return this({ theme });
}

const themeByPalette = new WeakMap<FlowPalette, WeakMap<FlowTypography, JssFlowTheme>>();
const getTheme = (palette: FlowPalette, typography: FlowTypography): JssFlowTheme => {
    let themeByTypography = themeByPalette.get(palette);
    if (!themeByTypography) {
        themeByPalette.set(palette, themeByTypography = new WeakMap());
    }
    let theme = themeByTypography.get(typography);
    if (!theme) {
        themeByTypography.set(typography, theme = Object.freeze({ palette, typography }));
    }
    return theme;
};
