import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatIndentIncrease } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const IncrementListLevelButton: FC<ToolbarProps> = ({controller, editingHost}) => {
    const current = controller.getListLevel();
    return (
        <ToolButton
            editingHost={editingHost}
            disabled={typeof current === "number" && current >= 9}
            onClick={controller.incrementListLevel.bind(controller)}
            children={<Icon path={mdiFormatIndentIncrease}/>}
        />
    );
};
