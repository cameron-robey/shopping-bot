import type { AutocompleteHandler } from "slshx";
import type { KVMetadataItems } from "./items";
import type { KVMetadataLists } from "./lists";

export const listsAutocomplete: AutocompleteHandler<string, Env> = async (
  interaction,
  env,
  ctx
) => {
  const items = (await env.lists.list<KVMetadataLists>()).keys;

  return items.map((item) => item.metadata?.name ?? "");
};

export const itemsAutocomplete: AutocompleteHandler<string, Env> = async (
  interaction,
  env,
  ctx
) => {
  const items = (await env.items.list<KVMetadataItems>()).keys;

  return items.map((item) => item.metadata?.item ?? "");
};
