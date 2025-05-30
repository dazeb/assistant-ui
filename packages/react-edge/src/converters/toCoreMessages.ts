import { ThreadMessage } from "@assistant-ui/react";
import { CoreMessage } from "../edge/CoreTypes";

type CoreMessageWithConditionalId<T extends boolean> = T extends false
  ? CoreMessage
  : CoreMessage & { unstable_id?: string };

export const toCoreMessages = <T extends boolean = false>(
  messages: readonly ThreadMessage[],
  options: { unstable_includeId?: T | undefined } = {},
): CoreMessageWithConditionalId<T>[] => {
  return messages.map((message) => toCoreMessage(message, options));
};

export const toCoreMessage = <T extends boolean = false>(
  message: ThreadMessage,
  options: { unstable_includeId?: T | undefined } = {},
): CoreMessageWithConditionalId<T> => {
  const includeId = options.unstable_includeId ?? false;
  const role = message.role;
  switch (role) {
    case "assistant":
      return {
        role,
        content: message.content
          .map((part) => {
            if (
              part.type === "reasoning" ||
              part.type === "source" ||
              part.type === "file"
            )
              return null; // reasoning, source, and file parts are omitted
            if (part.type === "tool-call") {
              const { argsText, ...rest } = part;
              return rest;
            }
            return part;
          })
          .filter((c) => !!c),
        ...(includeId ? { unstable_id: message.id } : {}),
      };

    case "user":
      return {
        role,
        content: [
          ...message.content,
          ...message.attachments.map((a) => a.content).flat(),
        ],
        ...(includeId ? { unstable_id: message.id } : {}),
      };

    case "system":
      return {
        role,
        content: message.content,
        ...(includeId ? { unstable_id: message.id } : {}),
      };

    default: {
      const unsupportedRole: never = role;
      throw new Error(`Unknown message role: ${unsupportedRole}`);
    }
  }
};
