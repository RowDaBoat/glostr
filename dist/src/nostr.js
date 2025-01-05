const { SimplePool, nip19 } = window.NostrTools;
const npub = 'npub1u3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnks2uxaql';
const { data: pubkey } = nip19.decode(npub);

const relays = [
    "wss://relay.damus.io",
    "wss://nostr-pub.wellorder.net",
    "wss://relay.snort.social"
];

const pool = new SimplePool();
const filter = [{ kinds: [1], authors: [pubkey] }];

console.log("todo piolar");
console.log(pool);

//const sub = pool.sub(relays, filter);

relays.forEach((relayUrl) => {
    console.log("will fetch from: " + relayUrl);

    const relay = pool.ensureRelay(relayUrl);

console.log(relay)

    relay.subscribe(filter, () => {
        
        console.log(`Connected to relay: ${relayUrl}`);
        const sub = relay.sub(subscriptionFilters);

        sub.on('event', (event) => {
            const postElement = document.createElement("div");
            postElement.textContent = event.content;
            document.getElementById("posts").appendChild(postElement);
        });

        sub.on('eose', () => {
            console.log(`End of stored events from relay: ${relayUrl}`);
        });
    });

    relay.on('error', (err) => {
        console.error(`Error connecting to relay: ${relayUrl}`, err);
    });
});
