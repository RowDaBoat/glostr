import { filter, map } from 'rxjs';
import Glostr from './glostr/glostr.ts'
import NostrPosts from './posts/nostrPosts.ts'
import LocalPosts from './posts/localPosts.ts';

//npub1u3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnks2uxaql
const npub = window.location.hash.substring(1)
const postsContainer = document.getElementById("glostr-posts")!!;
const glostr = new Glostr();

if (npub.length > 0) {
    console.log(npub)
    const posts = new NostrPosts()
    //const posts = new LocalPosts()

    posts.getPosts(npub).pipe(
        filter(message => hasGlsl(message)),
        map(message => extractGlsl(message))
    ).subscribe(code => {
        console.log("code: " + code)
        const shader = glostr.shader(code.trim(), 4/3)
        postsContainer.appendChild(shader.container)
        console.log("done")
    })
}

function hasGlsl(message: string): boolean {
    return message.indexOf("```glsl") >= 0
}

function extractGlsl(message: string): string {
    const part = message.split("```glsl")[1]
    const code = part.split("```")[0]
    return code
}
