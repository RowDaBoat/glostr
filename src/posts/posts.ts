import { Observable } from "rxjs";

export default interface Posts {
    getPosts(npub: string): Observable<string>
}
