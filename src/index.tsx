import { createHandler } from "slshx";
import { help } from "./help";
import { addItem, listItems, deleteItem } from "./items";
import { addList, listLists, deleteList, clearList } from "./lists";

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  // Add your commands here
  commands: {
    add: addItem,
    list: listItems,
    delete: deleteItem,
    addlist: addList,
    lists: listLists,
    deletelist: deleteList,
    clear: clearList,
    help: help
  },
});

export default { fetch: handler };
