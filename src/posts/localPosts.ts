import { from, map, mergeMap, Observable, of } from "rxjs";
import Posts from "./posts";

export default class LocalPosts implements Posts {
    getPosts(npub: string): Observable<string> {   
        return from(randomize([ "basic", "cyber-fuji", "starfield", "fractal-pyramid" ])).pipe(
            map(name => `shaders/${name}.glsl`),
            mergeMap(file => from(fetch(file))),
            mergeMap(resource => resource.text()),
            map(shader => "abc abc abc ```glsl" + shader + "``` 123 123 123")
        )
    }
}

function randomize(array: string[]): string[] {
    return array
        .map(value => ({value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}
