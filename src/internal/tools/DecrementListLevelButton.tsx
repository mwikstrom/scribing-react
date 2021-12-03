import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatIndentDecrease } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const DecrementListLevelButton: FC<ToolbarProps> = ({controller, editingHost}) => {
    const current = controller.getListLevel();
    return (
        <ToolButton
            editingHost={editingHost}
            disabled={typeof current === "number" && current <= 0}
            onClick={controller.decrementListLevel.bind(controller)}
            children={<Icon path={mdiFormatIndentDecrease}/>}
        />
    );
};
