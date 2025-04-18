"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { ToolCallContentPartProps } from "../types";
import { create } from "zustand";

export const useInlineRender = <TArgs, TResult>(
  toolUI: FC<ToolCallContentPartProps<TArgs, TResult>>,
): FC<ToolCallContentPartProps<TArgs, TResult>> => {
  const [useToolUI] = useState(() => create(() => toolUI));

  useEffect(() => {
    useToolUI.setState(toolUI);
  }, [toolUI, useToolUI]);

  return useCallback(
    function ToolUI(args) {
      const toolUI = useToolUI();
      return toolUI(args);
    },
    [useToolUI],
  );
};
