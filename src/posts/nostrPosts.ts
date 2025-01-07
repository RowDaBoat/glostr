import { nip19 } from 'nostr-tools';
import { createRxBackwardReq, createRxNostr } from 'rx-nostr'
import { verifier } from 'rx-nostr-crypto'
import { RxNostr } from 'rx-nostr/src'
import { map, Observable } from 'rxjs';
import Posts from './posts';

const relayUrls = [
    "wss://relay.damus.io",
    "wss://nostr-pub.wellorder.net",
    "wss://relay.snort.social",
    "wss://nostr.land",
    "wss://nostr.wine",
    "wss://nos.lol"
];

export default class NostrPosts implements Posts {
    private nostr: RxNostr

    constructor() {
        this.nostr = createRxNostr({ verifier })
        this.nostr.setDefaultRelays(relayUrls)
    }

    getPosts(npub: string): Observable<string> {
        const nostr = this.nostr
        const pubkey = pubkeyFrom(npub)
        const request = createRxBackwardReq()
        const filter = [ { kinds: [1], authors: [pubkey] } ]

        return onSubscribe(
            () => nostr.use(request).pipe(
                map(packet => packet.event.content)
            ),
            () => request.emit(filter)
        )
    }
}

function pubkeyFrom(npub: string): string {
    const decoded = nip19.decode(npub)
    
    if  (decoded.type !== 'npub')
        throw new Error(`Invalid npub: ${npub}`)

    return decoded.data
}

function onSubscribe<T>(pipe: () => Observable<T>, postSubscribe: () => void): Observable<T> {
    return new Observable<T>(subscriber => {
        const subscription = pipe().subscribe({
            next: (content) => subscriber.next(content),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete()
        })

        postSubscribe()

        return () => { subscription.unsubscribe() }
    })
}
