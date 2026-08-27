import { HomeFeed } from "@/components/faithin/HomeFeed";

/**
 * Faith In member home.
 *
 * The shell renders on the server; authentication and the Firestore read run
 * in the browser via the client component, so no credentials touch the server
 * render and the page streams immediately.
 */
export default function FaithInHomePage() {
  return <HomeFeed />;
}
