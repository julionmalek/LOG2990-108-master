import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { NgChartsModule } from 'ng2-charts';
import { ChatAreaComponent } from './components/chat-area/chat-area.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { KickoutDialogComponent } from './components/kickout-dialog/kickout-dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PopupComponent } from './components/popup/popup.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionSelectorComponent } from './components/question-selector/question-selector.component';
import { QuestionsBoxListComponent } from './components/questions-box-list/questions-box-list.component';
import { QuizCardComponent } from './components/quiz-card/quiz-card.component';
import { ResultsPlayerListComponent } from './components/results-player-list/results-player-list.component';
import { ResultsStatsComponent } from './components/results-stats/results-stats.component';
import { AppRoutingModule } from './modules/app-routing.module';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GameSelectPageComponent } from './pages/game-select-page/game-select-page.component';
import { JoindrePartieComponent } from './pages/joindre-partie/joindre-partie.component';
import { LoginAdminComponent } from './pages/login-admin/login-admin.component';
import { QuestionBankPageComponent } from './pages/question-bank-page/question-bank-page.component';
import { QuizCreationPageComponent } from './pages/quiz-creation-page/quiz-creation-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';
import { VueAdministrateurComponent } from './pages/vue-administrateur/vue-administrateur.component';
import { VueInitialeComponent } from './pages/vue-initiale/vue-initiale.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        NavbarComponent,
        QuizCreationPageComponent,
        VueInitialeComponent,
        LoginAdminComponent,
        QuizCardComponent,
        GameSelectPageComponent,
        PopupComponent,
        JoindrePartieComponent,
        QuestionBankPageComponent,
        QuestionFormComponent,
        QuestionsBoxListComponent,
        ChatAreaComponent,
        VueAdministrateurComponent,
        ConfirmDialogComponent,
        QuestionSelectorComponent,
        ResultsStatsComponent,
        ResultsPlayerListComponent,
        ResultsPageComponent,
        WaitingPageComponent,
        KickoutDialogComponent,
        GamePageComponent,
        HistogramComponent,
        PlayersListComponent,
    ],
    imports: [
        AppMaterialModule,
        MatTableModule,
        MatButtonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatSelectModule,
        MatTooltipModule,
        MatTabsModule,
        MatSidenavModule,
        MatDialogModule,
        MatSnackBarModule,
        MatMenuModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        NgChartsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    exports: [],
})
export class AppModule {}
