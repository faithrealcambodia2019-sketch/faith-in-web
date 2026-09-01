import fs from "node:fs";
import test, { after, before } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const projectId = "faith-in-rules-test";
const rules = fs.readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
let environment;

const now = () => Timestamp.now();

function authenticated(uid, email = "", provider = email ? "password" : "github.com", verified = !!email) {
  return environment.authenticatedContext(uid, {
    email,
    email_verified: verified,
    firebase: { sign_in_provider: provider },
  }).firestore();
}

function account(uid, email, extra = {}) {
  return {
    uid,
    email,
    emailLower: email.toLowerCase(),
    displayName: uid === "alice" ? "Alice" : "Bob",
    firstName: "",
    lastName: "",
    photoURL: "",
    provider: "password",
    providers: ["password"],
    appUserId: uid === "alice" ? 1 : 2,
    siteOrigin: "https://faithin.co",
    createdAt: now(),
    updatedAt: now(),
    lastLoginAt: now(),
    status: "active",
    ...extra,
  };
}

function publicProfile(uid, extra = {}) {
  return {
    uid,
    displayName: uid === "alice" ? "Alice" : "Bob",
    photoURL: "",
    appUserId: uid === "alice" ? 1 : 2,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

function post(uid, visibility = "public", extra = {}) {
  return {
    authorUid: uid,
    author: { uid, name: uid === "alice" ? "Alice" : "Bob", avatar_url: "" },
    type: "Text",
    title: "",
    excerpt: "",
    content: "A safe post",
    article_title: "",
    article_excerpt: "",
    article_body: "",
    media_items: [],
    cover_image_url: "",
    visibility,
    blessing_bg_color: "",
    allow_download: true,
    reactions: {},
    comment_count: 0,
    share_count: 0,
    repost_count: 0,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

before(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { rules } });
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users/alice"), account("alice", "alice@example.com"));
    await setDoc(doc(db, "users/bob"), account("bob", "bob@example.com"));
  });
});

after(async () => {
  await environment.cleanup();
});

test("account documents are private to their owner", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");
  const anonymous = environment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(alice, "users/alice")));
  await assertFails(getDoc(doc(bob, "users/alice")));
  await assertFails(getDoc(doc(anonymous, "users/alice")));
});

test("unverified password accounts cannot access member data", async () => {
  const unverified = authenticated("unverified", "unverified@example.com", "password", false);
  await assertFails(getDoc(doc(unverified, "publicProfiles/alice")));
  await assertFails(
    setDoc(doc(unverified, "posts/unverified"), post("unverified")),
  );
});

test("providers without a shared email can create only an email-empty account", async () => {
  const github = authenticated("github-user");
  await assertSucceeds(
    setDoc(doc(github, "users/github-user"), {
      ...account("github-user", ""),
      provider: "github",
      providers: ["github.com"],
    }),
  );
  await assertFails(
    setDoc(doc(github, "users/forged-user"), account("forged-user", "victim@example.com")),
  );
});

test("public profiles exclude email and cannot self-award verification", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");

  await assertSucceeds(setDoc(doc(alice, "publicProfiles/alice"), publicProfile("alice")));
  await assertSucceeds(getDoc(doc(bob, "publicProfiles/alice")));
  await assertFails(
    setDoc(doc(alice, "publicProfiles/alice"), publicProfile("alice", { email: "alice@example.com" })),
  );
  await assertFails(
    setDoc(
      doc(alice, "publicProfiles/alice"),
      publicProfile("alice", { verification: { show: true, type: "blue" } }),
    ),
  );
  await assertFails(
    updateDoc(doc(alice, "users/alice"), { verification: { show: true, type: "blue" } }),
  );
});

test("private posts are owner-only and ownership is immutable", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");

  await assertSucceeds(setDoc(doc(alice, "posts/public"), post("alice")));
  await assertSucceeds(setDoc(doc(alice, "posts/private"), post("alice", "private")));
  await assertSucceeds(setDoc(doc(alice, "posts/followers"), post("alice", "followers")));
  await assertSucceeds(getDoc(doc(bob, "posts/public")));
  await assertFails(getDoc(doc(bob, "posts/private")));
  await assertFails(getDoc(doc(bob, "posts/followers")));
  await assertSucceeds(
    setDoc(doc(bob, "follows/bob__alice"), {
      followerUid: "bob",
      targetUid: "alice",
      createdAt: now(),
    }),
  );
  await assertSucceeds(getDoc(doc(bob, "posts/followers")));
  await assertSucceeds(getDoc(doc(alice, "posts/private")));
  await assertFails(updateDoc(doc(bob, "posts/public"), { content: "stolen" }));
  await assertFails(updateDoc(doc(alice, "posts/public"), { authorUid: "bob" }));
});

test("engagement can only change the caller reaction or increment one counter", async () => {
  const bob = authenticated("bob", "bob@example.com");

  await assertSucceeds(updateDoc(doc(bob, "posts/public"), { "reactions.bob": "support" }));
  await assertFails(updateDoc(doc(bob, "posts/public"), { "reactions.alice": "like" }));
  await assertFails(updateDoc(doc(bob, "posts/public"), { share_count: 100 }));
  await assertSucceeds(updateDoc(doc(bob, "posts/public"), { share_count: 1 }));
});

test("follow ids and outbound job links are validated", async () => {
  const alice = authenticated("alice", "alice@example.com");

  const follow = { followerUid: "alice", targetUid: "bob", createdAt: now() };
  await assertFails(setDoc(doc(alice, "follows/wrong-id"), follow));
  await assertSucceeds(setDoc(doc(alice, "follows/alice__bob"), follow));

  const baseJob = {
    authorUid: "alice",
    title: "Pastor",
    organization: "Faith Church",
    location: "Phnom Penh",
    job_type: "Full-time",
    description: "Serve the congregation.",
    apply_url: "https://faith.example/jobs/1",
    contact_email: "",
    featured: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await assertSucceeds(setDoc(doc(alice, "jobs/safe"), baseJob));
  await assertFails(setDoc(doc(alice, "jobs/script"), { ...baseJob, apply_url: "javascript:alert(1)" }));
  await assertFails(setDoc(doc(alice, "jobs/no-contact"), { ...baseJob, apply_url: "" }));
});

test("comments support safe media and caller-scoped reactions", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");

  await assertSucceeds(setDoc(doc(alice, "posts/comments-test"), post("alice")));
  const comment = {
    authorUid: "bob",
    author: { uid: "bob", name: "Bob", avatar_url: "" },
    content: "Amen",
    media_url: "",
    reactions: {},
    createdAt: now(),
  };
  await assertSucceeds(setDoc(doc(bob, "posts/comments-test/comments/comment-1"), comment));
  await assertFails(
    setDoc(doc(bob, "posts/comments-test/comments/unsafe"), {
      ...comment,
      media_url: "javascript:alert(1)",
    }),
  );
  await assertSucceeds(
    updateDoc(doc(alice, "posts/comments-test/comments/comment-1"), { "reactions.alice": "like" }),
  );
  await assertFails(
    updateDoc(doc(bob, "posts/comments-test/comments/comment-1"), { "reactions.alice": null }),
  );
});

test("direct messages are private to their two participants", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");
  const charlie = authenticated("charlie", "charlie@example.com");
  const threadPath = "messageThreads/alice__bob";
  const profile = (uid, id) => ({ uid, id, name: uid === "alice" ? "Alice" : "Bob", avatar_url: "" });

  await assertSucceeds(
    setDoc(doc(alice, threadPath), {
      participants: ["alice", "bob"],
      participantProfiles: { alice: profile("alice", 1), bob: profile("bob", 2) },
      lastMessage: "Hello",
      lastMessageAt: now(),
      lastSenderUid: "alice",
      readAt: {},
      createdAt: now(),
      updatedAt: now(),
    }),
  );
  await assertFails(
    setDoc(doc(alice, "messageThreads/not-the-direct-id"), {
      participants: ["alice", "bob"],
      participantProfiles: { alice: profile("alice", 1), bob: profile("bob", 2) },
      lastMessage: "Hello",
      lastMessageAt: now(),
      lastSenderUid: "alice",
      readAt: {},
      createdAt: now(),
      updatedAt: now(),
    }),
  );
  await assertFails(
    setDoc(doc(alice, "messageThreads/alice__charlie"), {
      participants: ["alice", "charlie"],
      participantProfiles: {
        alice: profile("alice", 1),
        charlie: { ...profile("charlie", 3), uid: "admin" },
      },
      lastMessage: "Hello",
      lastMessageAt: now(),
      lastSenderUid: "alice",
      readAt: {},
      createdAt: now(),
      updatedAt: now(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(alice, `${threadPath}/messages/message-1`), {
      authorUid: "alice",
      body: "Hello",
      attachment: null,
      createdAt: now(),
    }),
  );
  await assertSucceeds(getDoc(doc(bob, threadPath)));
  await assertSucceeds(getDoc(doc(bob, `${threadPath}/messages/message-1`)));
  await assertFails(getDoc(doc(charlie, threadPath)));
  await assertFails(getDoc(doc(charlie, `${threadPath}/messages/message-1`)));
  await assertSucceeds(updateDoc(doc(bob, threadPath), { "readAt.bob": now() }));
  await assertFails(updateDoc(doc(bob, threadPath), { "readAt.alice": now() }));
  await assertFails(
    setDoc(doc(charlie, `${threadPath}/messages/message-2`), {
      authorUid: "charlie",
      body: "Intrusion",
      attachment: null,
      createdAt: now(),
    }),
  );
});

test("presence and typing can only be written for yourself", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("presence-bob", "presence-bob@example.com");
  const charlie = authenticated("charlie", "charlie@example.com");
  const threadPath = "messageThreads/alice__presence-bob";
  const profile = (uid, id) => ({ uid, id, name: uid, avatar_url: "" });

  await assertSucceeds(
    setDoc(doc(alice, threadPath), {
      participants: ["alice", "presence-bob"],
      participantProfiles: {
        alice: profile("alice", 1),
        "presence-bob": profile("presence-bob", 2),
      },
      lastMessage: "Hello",
      lastMessageAt: now(),
      lastSenderUid: "alice",
      readAt: {},
      createdAt: now(),
      updatedAt: now(),
    }),
  );

  await assertSucceeds(
    updateDoc(doc(bob, threadPath), { "presence.presence-bob": { at: now(), typing: true } }),
  );
  await assertSucceeds(
    updateDoc(doc(bob, threadPath), { "presence.presence-bob": { at: now(), typing: false } }),
  );

  // Nobody may claim that another member is present or typing.
  await assertFails(
    updateDoc(doc(bob, threadPath), { "presence.alice": { at: now(), typing: true } }),
  );
  await assertFails(
    updateDoc(doc(charlie, threadPath), { "presence.charlie": { at: now(), typing: true } }),
  );

  // The entry carries only the two fields the interface reads.
  await assertFails(
    updateDoc(doc(bob, threadPath), {
      "presence.presence-bob": { at: now(), typing: true, role: "admin" },
    }),
  );
  await assertFails(
    updateDoc(doc(bob, threadPath), { "presence.presence-bob": { at: now(), typing: "yes" } }),
  );

  // Presence must not be a way to smuggle a change into the conversation.
  await assertFails(
    updateDoc(doc(bob, threadPath), {
      "presence.presence-bob": { at: now(), typing: true },
      lastMessage: "Rewritten",
    }),
  );
});

test("notifications can only be created by their actor and read by their recipient", async () => {
  const alice = authenticated("alice", "alice@example.com");
  const bob = authenticated("bob", "bob@example.com");
  const charlie = authenticated("charlie", "charlie@example.com");
  const notificationPath = "notifications/follow__profile-bob__alice";
  const notification = {
    recipientUid: "bob",
    actorUid: "alice",
    actor: { uid: "alice", id: 1, name: "Alice", avatar_url: "" },
    type: "follow",
    objectId: "profile-bob",
    objectType: "profile",
    isRead: false,
    createdAt: now(),
    readAt: null,
  };

  await assertSucceeds(setDoc(doc(alice, notificationPath), notification));
  await assertSucceeds(getDoc(doc(bob, notificationPath)));
  await assertFails(getDoc(doc(charlie, notificationPath)));
  await assertSucceeds(updateDoc(doc(bob, notificationPath), { isRead: true, readAt: now() }));
  await assertFails(
    setDoc(doc(charlie, "notifications/follow__profile-bob__alice"), notification),
  );
});
