import {
  CommandHandler,
  useDescription,
  useString,
  createElement,
  Message,
  createFollowupMessage
} from "slshx";
import { listsAutocomplete } from "./helpers";
import { KVMetadataItems } from "./items";

export interface KVMetadataLists {
  name: string;
  user: {
    id: string;
    name: string;
  }
  date: string;
}

export function addList(): CommandHandler<Env> {
  useDescription("Creates a shopping list");

  const name = useString("name", "The name of the shopping list", { required: true });

  return async (interaction, env, ctx) => {
    // Lookup to see if there is a list with that name
    if ((await env.lists.get(name)) !== null) {
      // Exists

      return <Message ephemeral>
        🤷‍♀️ That list already exists... 😢
      </Message>
    }

    // Add to KV
    await env.lists.put(name, "", {
      metadata: {
        name: name,
        user: {
          id: interaction.member?.user.id,
          name: interaction.member?.user.username,
        },
        date: new Date().toISOString(),
      }
    });

    return <Message>
      ✨ Congrats {`<@${interaction.member?.user.id}>`}! You just created a shopping list named **{name}**!
    </Message>
  }
}

export function listLists(): CommandHandler<Env> {
  useDescription("Print out all active shopping lists");

  return async (interaction, env, ctx) => {
    // Add to KV
    const lists = (await env.lists.list<KVMetadataLists>()).keys;

    if (lists.length === 0) {
      return <Message>
        🤷‍♀️ There are no active shopping lists. That's ok, you can still use the default list, or create one with `/addlist` ⛅
      </Message>
    }

    const text = lists.map((list) => {
      return `- ✨ **${list.metadata?.name}** ✨    [added by **${list.metadata?.user.name}**]`;
    });

    text.push("-------------------------------")
    text.push("- ✨ **default** ✨   [the default list - cannot be removed]");

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
      🎉 Tada {`<@${interaction.member?.user.id}>`} 🎉! Here are all the shopping lists! 🛍
    </Message>
  }
}

export function deleteList(): CommandHandler<Env> {
  useDescription("Removes a shopping list - to do this, the shopping list must be empty");

  const name = useString<Env>("name", "The name of the list to delete", {
    required: true,
    autocomplete: listsAutocomplete
   });
  
  return async (interaction, env, ctx) => {
    // List and filter by item
    const lists = (await env.lists.list<KVMetadataLists>()).keys;
    const filtered = lists.find(l => l.metadata?.name === name);

    if (filtered === undefined) {
      return <Message ephemeral>
        🤦‍♀️Whoops! That list doesn't actually exist... 😢
      </Message>
    }

    // Now we find if there are any items on the list
    const items = (await env.items.list<KVMetadataItems>({
      prefix: name
    })).keys;

    if (items.length > 0) {
      return <Message ephemeral>
        🤦‍♀️Whoops! There are still items left on that shopping list... 😢 You can clear the shopping list with `/clear {filtered.metadata?.name}` 🚀
      </Message>
    }

    // Remove from KV
    await env.lists.delete(filtered.name);

    return <Message>
      ✨ Congrats {`<@${interaction.member?.user.id}>`}! You just deleted the shopping list **{name}**!
    </Message>
  }
}

export function clearList(): CommandHandler<Env> {
  useDescription("Clear all the items off a list, without deleting the list");

  const name = useString<Env>("name", "The name of the list to delete", {
    required: true,
    autocomplete: listsAutocomplete
   });
  
  return async (interaction, env, ctx) => {
    // List and filter by item
    const lists = (await env.lists.list<KVMetadataLists>()).keys;
    const filtered = lists.find(l => l.metadata?.name === name);

    if (filtered === undefined) {
      return <Message ephemeral>
        🤦‍♀️Whoops! That list doesn't actually exist... 😢
      </Message>
    }

    // Now we find if there are any items on the list
    const items = (await env.items.list<KVMetadataItems>({
      prefix: name
    })).keys;

    if (items.length === 0) {
      return <Message ephemeral>
        🤦‍♀️Whoops! That list was already empty... 😢
      </Message>
    }

    for (const item of items) {
      await env.items.delete(item.name);
    }

    return <Message>
      ✨ Congrats {`<@${interaction.member?.user.id}>`}! You just cleared the shopping list **{name}**!
    </Message>
  }
}