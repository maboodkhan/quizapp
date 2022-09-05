import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { QuizSetEditComponent } from './quiz-set-edit/quiz-set-edit.component';

@Injectable({
  providedIn: 'root'
})
export class QuizEditGuard implements CanDeactivate<QuizSetEditComponent> {
  canDeactivate(component: QuizSetEditComponent): boolean {
    return true;
  }
}
