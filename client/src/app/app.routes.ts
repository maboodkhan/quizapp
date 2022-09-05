import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AboutComponent } from './about';
import { NotFoundPageComponent } from './notfoundpage';
import { RootComponent } from './root';
import { LoginComponent } from './login';
import { AuthGuard } from './_guard';
import { AutologinComponent } from './login/autologin.component';

export const ROUTES: Routes = [
  { path: '', component: RootComponent, canActivate: [AuthGuard] },
  { path: 'root', component: RootComponent },
  { path: 'login', component: RootComponent },
  { path: 'applogin', component: AutologinComponent },
  { path: '**', component: NotFoundPageComponent, canActivate: [AuthGuard] }
];
