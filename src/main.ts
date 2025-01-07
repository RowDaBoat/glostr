import { filter, firstValueFrom, map, take, takeLast } from 'rxjs';
import Glostr from './glostr/glostr.ts'
import NostrPosts from './posts/nostrPosts.ts'
import noticeHtml from './glostr-notice.html?raw'
import noticeStyle from './glostr-notice.css?inline'

const npub = window.location.hash.substring(1)
const postsContainer = document.getElementById("glostr-posts")!!;
const glostr = new Glostr();
const posts = new NostrPosts()

if (npub.length > 0) {
    posts.getPosts(npub).pipe(
        filter(message => hasGlsl(message)),
        map(message => extractGlsl(message))
    ).subscribe(code => {
        const shader = glostr.shader(code.trim(), 4/3)
        postsContainer.appendChild(shader.container)
    })
} else {
    const rowsNpub = "npub1u3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnks2uxaql"
    posts.getPosts(rowsNpub).pipe(
        filter(message => hasGlsl(message)),
        map(message => {
            console.log("woot")
            return extractGlsl(message)
        }),
        take(1)
    ).subscribe(code => {
        console.log("weet")
        const shader = glostr.shader(code.trim(), 4/3)
        postsContainer.prepend(shader.container)
    })

    postsContainer.appendChild(buildElement(noticeHtml, noticeStyle))
}

function hasGlsl(message: string): boolean {
    return message.indexOf("```glsl") >= 0
}

function extractGlsl(message: string): string {
    const part = message.split("```glsl")[1]
    const code = part.split("```")[0]
    return code
}

//TODO: refactor
function buildElement(htmlText: string, cssText: string): HTMLElement {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, 'text/html')
    const element = doc.body.firstElementChild as HTMLElement
    const style = document.createElement('style')
    style.textContent = cssText
    element.appendChild(style)
    return element
}
