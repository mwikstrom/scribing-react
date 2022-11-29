import React, { createContext, FC, useContext } from "react";

/**
 * Nested `<FlowView>` components use a shared counter for list items on level 1
 * @public
 */
export const SharedListCounterScope: FC = props => (
    <div style={{counterReset: "li1 0"}}>
        <SharedListCounterContext.Provider {...props} value={true} />
    </div>
);

/**
 * @public
 */
export const useIsInsideSharedListCounterScope = (): boolean => useContext(SharedListCounterContext);

const SharedListCounterContext = createContext(false);
