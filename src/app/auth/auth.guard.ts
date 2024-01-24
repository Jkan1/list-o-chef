import { Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';

@Injectable({ providedIn: "root" })
export class AuthGuard  {

    constructor(private router: Router, private store: Store<AppState>) { }

    canActivate()
        : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
        return this.store.select('auth').pipe(take(1),
        map((authState) => {
            return authState.user;
        }),
        map(
            (data) => { 
                const isAuth = !!data;
                if (isAuth) {
                    return true;
                }
                return this.router.createUrlTree(['/auth']);
            }
        ));
    }

}