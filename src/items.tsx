import {
  CommandHandler,
  useDescription,
  useString,
  createElement,
  Message,
  createFollowupMessage
} from "slshx";

import { itemsAutocomplete, listsAutocomplete } from "./helpers";
import { KVMetadataLists } from "./lists";

export interface KVMetadataItems {
  item: string;
  user: {
    id: string;
    name: string;
  }
  date: string;
}

export function addItem(): CommandHandler<Env> {
  useDescription("Adds an item to the shopping list");

  const item = useString("item", "The item to add", { required: true });
  const list = useString<Env>("name", "The shopping list to add to", {
    required: false,
    autocomplete: listsAutocomplete,
  });
  
  return async (interaction, env, ctx) => {
    // Add to KV
    const prefix = list ?? "default";

    await env.items.put(`${prefix}${interaction.id}`, "", {
      metadata: {
        item: item,
        user: {
          id: interaction.member?.user.id,
          name: interaction.member?.user.username
        },
        date: new Date().toISOString(),
        list: prefix
      }
    });

    return <Message>
      ✨ Congrats {`<@${interaction.member?.user.id}>`}! You just added **{item}** to the shopping list{list ? ` **${list}**` : ""}!
    </Message>
  }
}

export function listItems(): CommandHandler<Env> {
  useDescription("Print out the shoppings list");
  
  const list = useString<Env>("name", "The shopping list to add to", {
    required: false,
    autocomplete: listsAutocomplete,
  });

  return async (interaction, env, ctx) => {
    // Check if the ist exists
    const prefix = list ?? "default";

    if (prefix !== "default") {
      const checkList = (await env.lists.list<KVMetadataLists>()).keys.filter( i => (
        i.metadata?.name === prefix
      ));

      if (checkList.length === 0) {
        return <Message ephemeral>
          🤦‍♀️Whoops! That list doesn't actually exist... 😢
        </Message> 
      }
    }

    // Add to KV
    const items = (await env.items.list<KVMetadataItems>({ prefix })).keys;

    if (items.length === 0) {
      return <Message>
        🎉 The shopping list{prefix === "default" ? "" : ` **${prefix}**`} is empty! 🛍
      </Message>
    }

    const text = items.map((item) => {
      return `- ✨ **${item.metadata?.item}** ✨    [added by **${item.metadata?.user.name}**]`;
    });

    // We want to send messages in chunks of 2000 characters
    const chunks = [];
    let currentChunk = "";
    for (const line of text) {
      if (currentChunk.length + line.length > 2000) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += line + "\n";
    }
    chunks.push(currentChunk);


    for (const chunk of chunks) {
      ctx.waitUntil(
      createFollowupMessage(
        SLSHX_APPLICATION_ID,
        interaction.token,
        <Message>{chunk}</Message>
      ));
    }

    return <Message>
      🎉 Tada {`<@${interaction.member?.user.id}>`} 🎉! Here's the shopping list! 🛍
    </Message>
  }
}

export function deleteItem(): CommandHandler<Env> {
  useDescription("Adds an item to the shopping list");

  const item = useString<Env>("item", "The item to add", {
    required: true,
    autocomplete: itemsAutocomplete
   });
   
  const list = useString("name", "The shopping list to add to", { required: false });
  
  return async (interaction, env, ctx) => {
    // List and filter by item
    const items = (await env.items.list<KVMetadataItems>()).keys;
    const filtered = items.find(i => i.metadata?.item === item);

    if (filtered === undefined) {
      return <Message ephemeral>
        🤦‍♀️Whoops! That item wasn't on the shopping list... 😢
      </Message>
    }

    // Remove from KV
    await env.items.delete(filtered.name);

    return <Message>
      ✨ Congrats {`<@${interaction.member?.user.id}>`}! You just deleted **{item}** to the shopping list!
    </Message>
  }
}