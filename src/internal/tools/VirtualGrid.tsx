import React, { CSSProperties, ReactElement, useEffect, useMemo, useState } from "react";
import { useElementSize } from "../hooks/use-element-size";
import { useScrollPosition } from "../hooks/use-scroll-position";

export interface VirtualGridProps<T> {
    className: string;
    children: readonly T[];
    itemWidth: number;
    itemHeight: number;
    getItemKey: (item: T) => string | number;
    renderItem: (item: T) => ReactElement;
    resetScrollOnChange?: boolean;
}

export function VirtualGrid<T>(props: VirtualGridProps<T>): ReactElement {
    const { className, children: allItems, itemWidth, itemHeight, getItemKey, renderItem, resetScrollOnChange } = props;
    const [gridElement, setGridElement] = useState<HTMLElement | null>(null);
    const { width: gridWidth, height: gridHeight } = useElementSize(gridElement);
    const { top: scrollTop } = useScrollPosition(gridElement);
    const itemsPerRow = Math.max(1, Math.floor(gridWidth / itemWidth));
    const indexOfFirstRow = Math.floor(scrollTop / itemHeight);
    const allRows = useMemo(() => {
        const result: T[][] = [];
        for (let i = 0; i < allItems.length; i += itemsPerRow) {
            result.push(allItems.slice(i, i + itemsPerRow));
        }
        return result;
    }, [allItems, itemsPerRow]);
    const visibleRows = useMemo(() => {
        const visibleRowCount = 2 + Math.floor(gridHeight / itemHeight);
        return allRows.slice(indexOfFirstRow, indexOfFirstRow + visibleRowCount);
    }, [indexOfFirstRow, allRows, gridHeight, itemHeight]);
    const itemStyle = useMemo<CSSProperties>(() => ({
        display: "inline-block",
        overflow: "hidden",
        width: itemWidth,
        height: itemHeight,
    }), [itemWidth, itemHeight]);
    useEffect(() => {
        if (resetScrollOnChange && gridElement) {
            gridElement.scrollTo({ top: 0 });
        }
    }, [allItems, resetScrollOnChange, gridElement]);
    const paddingTop = indexOfFirstRow * itemHeight;
    const paddingBottom = Math.max(0, allRows.length - visibleRows.length - indexOfFirstRow) * itemHeight;
    return (
        <div ref={setGridElement} className={className} style={GRID_STYLE}>
            <div style={{paddingTop, paddingBottom}}>
                {visibleRows.map((row, index) => (
                    <div key={indexOfFirstRow + index}>
                        {row.map(item => (
                            <span key={getItemKey(item)} style={itemStyle}>
                                {renderItem(item)}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

const GRID_STYLE: CSSProperties = {
    overflowY: "auto", 
    overflowX: "hidden", 
};
