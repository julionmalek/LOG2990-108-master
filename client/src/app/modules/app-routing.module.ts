import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInAuth } from '@app/components/logged-in.auth/logged-in.auth';
import { directNavigationGuard } from '@app/guards/direct-navigation-guard/direct-navigation-guard';
import { navigationGuard } from '@app/guards/navigation-guard/navigation.guard';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameSelectPageComponent } from '@app/pages/game-select-page/game-select-page.component';
import { JoindrePartieComponent } from '@app/pages/joindre-partie/joindre-partie.component';
import { LoginAdminComponent } from '@app/pages/login-admin/login-admin.component';
import { QuestionBankPageComponent } from '@app/pages/question-bank-page/question-bank-page.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';
import { ResultsPageComponent } from '@app/pages/results-page/results-page.component';
import { VueAdministrateurComponent } from '@app/pages/vue-administrateur/vue-administrateur.component';
import { VueInitialeComponent } from '@app/pages/vue-initiale/vue-initiale.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: VueInitialeComponent },
    { path: 'joindre-partie', component: JoindrePartieComponent },
    { path: 'login-admin', component: LoginAdminComponent },
    { path: 'vue-admin', component: VueAdministrateurComponent, canActivate: [LoggedInAuth] },
    { path: 'select-game', component: GameSelectPageComponent },
    { path: 'question-bank', component: QuestionBankPageComponent, canActivate: [LoggedInAuth] },
    { path: 'create-quiz', component: QuizCreationPageComponent, canActivate: [LoggedInAuth] },
    { path: 'modify-quiz/:quizId', component: QuizCreationPageComponent, canActivate: [LoggedInAuth] },
    { path: 'waiting-page/:gameId', component: WaitingPageComponent, canDeactivate: [navigationGuard], canActivate: [directNavigationGuard] },
    { path: 'game-page/:gameId', component: GamePageComponent, canDeactivate: [navigationGuard], canActivate: [directNavigationGuard] },
    { path: 'results-page/:gameId', component: ResultsPageComponent, canActivate: [directNavigationGuard] },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
