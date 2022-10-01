import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
} from "slshx";

export function help(): CommandHandler<Env> {
  useDescription("Print the list of commands");
  
  return async (interaction, env, ctx) => {
    const lines = [
      "Hey 👋 !",
      "I'm ✨ Shopping Bot ✨ and will help with this channel 🛍️",
      "",
      "**Commands:**",
      "```",
      "/add     [item]  [list:optional]   Add an item to a shopping list",
      "/list            [list:optional]   Print out a shopping list",
      "/delete  [item]  [list:optional]   Delete an item from a list",
      "/addlist         [list]            Create a shopping list",
      "/lists                             List all shopping lists",
      "/deletelist      [list]            Delete a list (must be empty)",
      "/clear           [list:optional]   Clear a list (without deleting)",
      "```",
    ];

    return <Message ephemeral>
      {lines.join("\n")}
    </Message>
  }
}