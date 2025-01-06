import { SimplePool, nip19 } from 'nostr-tools';

const relayUrls = [
    "wss://relay.damus.io",
    "wss://nostr-pub.wellorder.net",
    "wss://relay.snort.social"
];

export default function getPosts(npub: string) {
    const post = document.body
    const decoded = nip19.decode(npub)

    if  (decoded.type !== 'npub')
        throw new Error(`Invalid npub: ${npub}`)

    const pubkey = decoded.data
    console.log("pub key: " + pubkey as string)

    const pool = new SimplePool();
    const filters = [
        { kinds: [1], authors: [pubkey] }
    ];

    relayUrls.forEach(async (url) => {
        const relay = await pool.ensureRelay(url)
        console.log("Relay ensured: " + relay.url)

        const sub = relay.subscribe(filters, {});

        sub.onevent = event =>
            post.innerHTML += `Post:<br>${event.content}<br>&#9;from ${relay.url}<br><br>`

        sub.onclose = reason =>
            post.innerHTML += `That's all from ${relay.url} (${reason}) bye!<br><br>`

        sub.fire()
        post.innerHTML += `Waiting for posts from ${relay.url}...<br><br>`
    })
}
