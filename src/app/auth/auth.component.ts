import { Component, ViewChild, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { AppPlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { LoginStart, SignupStart, ClearError } from './store/auth.actions'
import { trigger, transition, style, animate, state } from '@angular/animations';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


const animations = [
    trigger('formAnimation', [
        state('login', style({
            "opacity": 1
        })),
        transition('* => login,* => signup', [
            style({
                "opacity": 0
            }),
            animate(300)
        ])
    ])
]

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styles: [' .form-profile-preview { height:100px; width:100px; } '],
    animations: animations
})
export class AuthComponent implements OnInit, OnDestroy {
    isLoginMode = true;
    isLoading = false;
    animationState = 'login'
    @ViewChild(AppPlaceholderDirective) alertHost: AppPlaceholderDirective;

    private closeSub: Subscription;
    private storeSub: Subscription;

    constructor(
        private store: Store<AppState>,
        private router: Router
    ) { }

    onSwitchMode() {
        this.animationState = this.animationState === 'login' ? 'signup' : 'login';
        this.isLoginMode = !this.isLoginMode;
    }

    ngOnInit() {
        this.storeSub = this.store.select('auth').subscribe((authState) => {
            this.isLoading = authState.loading;
            if (authState.authError)
                this.onShowError(authState.authError);
            if(authState.user && authState.user.token){
                this.router.navigate(['user']);
            }
        });
    }

    onSubmit(authForm: NgForm) {
        if (!authForm.valid) {
            return;
        }
        const email: string = authForm.value.email;
        const password = authForm.value.password;
        const userName = authForm.value.userName;
        const profileImage = authForm.value.profileImage;
        const inviteCode = authForm.value.inviteCode;
        if (environment.production && email.match('yopmail.com')) {
            return;
        }
        if (this.isLoginMode) {
            this.store.dispatch(new LoginStart({ email, password }))
        } else {
            this.store.dispatch(new SignupStart({ email, password, userName, profileImage, inviteCode }));
        }

        this.store.select('auth').subscribe();

        authForm.reset();
    }

    onShowError(errorMessage) {
        const hostViewContainerRef = this.alertHost.viewContainerRef;
        hostViewContainerRef.clear();
        const alertComponentRef = hostViewContainerRef.createComponent(AlertComponent);
        alertComponentRef.instance.message = errorMessage;
        this.closeSub = alertComponentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
            this.store.dispatch(new ClearError());
        });
    }

    ngOnDestroy() {
        if (this.closeSub) {
            this.closeSub.unsubscribe();
        }
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }
    }

}