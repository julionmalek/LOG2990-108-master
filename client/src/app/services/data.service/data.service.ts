import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Feedback } from '@app/interfaces/feedback';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private apiQuiz = environment.serverUrl + '/quiz';
    private apiQuestions = environment.serverUrl + '/questions';
    private apiQuizById = environment.serverUrl + '/quiz/:id';
    private apiValidateQuestion = environment.serverUrl + '/validate-question/:id';
    private apiPreloadQuiz = environment.serverUrl + '/preload-quiz/:id';
    private apiCreateGame = environment.serverUrl + '/create-game';
    private apiDeleteGame = environment.serverUrl + '/delete-game';
    private apiValidateGame = environment.serverUrl + '/validate-game';

    constructor(private http: HttpClient) {}

    fetchQuiz(): Observable<HttpResponse<Quiz[]>> {
        return this.http.get<Quiz[]>(this.apiQuiz, { observe: 'response' });
    }
    fetchQuizById(id: string): Observable<HttpResponse<Quiz>> {
        const url: string = this.apiQuizById.replace(':id', id);
        return this.http.get<Quiz>(url, { observe: 'response' });
    }

    fetchQuestions(): Observable<HttpResponse<Question[]>> {
        return this.http.get<Question[]>(this.apiQuestions, { observe: 'response' });
    }
    deleteQuestion(id: string): Observable<HttpResponse<Question>> {
        const url = `${this.apiQuestions}/${id}`;
        return this.http.delete<Question>(url, { observe: 'response' });
    }
    saveQuestion(data: Question): Observable<HttpResponse<Question>> {
        return this.http.post<Question>(this.apiQuestions, data, { observe: 'response' });
    }

    updateQuestion(id: string, data: Question): Observable<HttpResponse<Question>> {
        const url = `${this.apiQuestions}/${id}`;
        return this.http.patch<Question>(url, data, { observe: 'response' });
    }

    saveQuiz(data: Quiz): Observable<HttpResponse<Quiz>> {
        return this.http.post<Quiz>(this.apiQuiz, data, { observe: 'response' });
    }

    updateQuiz(id: string, data: Quiz): Observable<HttpResponse<Quiz>> {
        const url: string = this.apiQuizById.replace(':id', id);
        return this.http.patch<Quiz>(url, data, { observe: 'response' });
    }

    toggleQuizHidden(id: string, hidden: boolean): Observable<HttpResponse<Quiz>> {
        const url: string = this.apiQuizById.replace(':id', id);
        return this.http.patch<Quiz>(url, { hidden: !hidden }, { observe: 'response' });
    }

    deleteQuiz(id: string): Observable<HttpResponse<Quiz>> {
        const url: string = this.apiQuizById.replace(':id', id);
        return this.http.delete<Quiz>(url, { observe: 'response' });
    }

    validateQuestion(id: string, questionIndex: number, answerIndices: number[]): Observable<HttpResponse<Feedback>> {
        const url = this.apiValidateQuestion.replace(':id', id);
        return this.http.post<Feedback>(url, { questionIndex, answerIndices }, { observe: 'response' });
    }

    preloadQuiz(id: string): Observable<string> {
        const url = this.apiPreloadQuiz.replace(':id', id);
        return this.http.get(url, { responseType: 'text' });
    }

    validateGameId(gameId: string): Observable<HttpResponse<{ isValid: boolean; message?: string }>> {
        const url = `${this.apiValidateGame}/${gameId}`;
        return this.http.get<{ isValid: boolean; message?: string }>(url, { observe: 'response' });
    }
    createGame(): Observable<HttpResponse<{ gameId: string }>> {
        return this.http.post<{ gameId: string }>(this.apiCreateGame, {}, { observe: 'response' });
    }

    deleteGameId(gameId: string): Observable<HttpResponse<{ message: string }>> {
        const url = `${this.apiDeleteGame}/${gameId}`;
        return this.http.delete<{ message: string }>(url, { observe: 'response' });
    }
}
