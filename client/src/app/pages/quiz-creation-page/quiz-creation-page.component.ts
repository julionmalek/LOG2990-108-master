import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpStatusCode } from '@angular/common/http';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { QuestionSelectorComponent } from '@app/components/question-selector/question-selector.component';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { DataService } from '@app/services/data.service/data.service';
import { SORTING, VALIDATION } from '@utilities/constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-quiz-creation-page',
    templateUrl: './quiz-creation-page.component.html',
    styleUrls: ['./quiz-creation-page.component.scss'],
})
export class QuizCreationPageComponent implements OnInit, OnDestroy {
    form: FormGroup;
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private dataService: DataService,
        private injector: Injector,
    ) {}

    get questions(): FormArray {
        return this.form.get('questions') as FormArray;
    }

    ngOnInit(): void {
        this.createForm();
        const url = this.injector.get(Router).url;
        const urlSections = url.split('/');
        const quizId = urlSections[urlSections.length - 1];

        if (quizId && urlSections.includes('modify-quiz')) {
            this.dataService
                .fetchQuizById(quizId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        if (response.body) {
                            this.form.patchValue(response.body);
                        }

                        const questions = this.form.get('questions') as FormArray;
                        questions.clear();

                        response.body?.questions.forEach((question) => {
                            questions.push(this.createQuestion(question));
                        });
                    },
                    error: () => {
                        this.injector.get(MatSnackBar).open('Erreur lors du chargement du quiz. Veuillez reessayer plus tard.', '', {
                            duration: 5000,
                        });
                    },
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    importQuiz(event: Event): void {
        const element = event.target as HTMLInputElement;
        const files = element.files;

        if (files && files.length > 0) {
            const file = files[0];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                try {
                    const quiz = JSON.parse(fileReader.result as string);
                    const questionsFormArray = this.form.get('questions') as FormArray;
                    questionsFormArray.clear();

                    quiz.questions.forEach((question: Question) => {
                        questionsFormArray.push(this.createQuestion(question));
                    });

                    this.form.patchValue(quiz);
                } catch (error) {
                    if (error instanceof Error) {
                        this.injector.get(MatSnackBar).open(error.message, '', {
                            duration: 5000,
                            panelClass: ['warn-snackbar'],
                        });
                    }
                }
            };

            fileReader.readAsText(file);
        }
    }

    getChoices(question: AbstractControl): FormArray {
        return question.get('choices') as FormArray;
    }

    createForm(): void {
        this.form = this.injector.get(FormBuilder).group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            hidden: [true],
            duration: ['', [Validators.required, Validators.min(VALIDATION.MinQuestionDuration), Validators.max(VALIDATION.MaxQuestionDuration)]],
            questions: this.injector.get(FormBuilder).array([this.createQuestion()], Validators.required),
        });
    }

    createQuestion(questionData?: Question): FormGroup {
        return this.injector.get(FormBuilder).group({
            type: 'QCM',
            text: [questionData?.text || '', Validators.required],
            points: [
                questionData?.points || '',
                [
                    Validators.required,
                    Validators.min(VALIDATION.MinQuestionPoints),
                    Validators.max(VALIDATION.MaxQuestionPoints),
                    this.multipleOf(VALIDATION.MinQuestionPoints),
                ],
            ],
            choices: this.injector
                .get(FormBuilder)
                .array(
                    questionData?.choices.length
                        ? questionData.choices.map((choice) => this.createChoice(choice))
                        : [this.createChoice(), this.createChoice()],
                    [Validators.required, this.hasCorrectAndIncorrectChoice()],
                ),
        });
    }

    addQuestion(): void {
        this.questions.push(this.createQuestion());
    }

    deleteQuestion(index: number): void {
        this.questions.removeAt(index);
    }

    loadQuestionFromBank(): void {
        const selectorRef = this.injector.get(MatDialog).open(QuestionSelectorComponent);
        selectorRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((selectedQuestion) => {
                if (selectedQuestion) {
                    this.questions.push(this.createQuestion(selectedQuestion));
                }
            });
    }

    saveQuestionToBank(questionIndex: number): void {
        const question = this.questions.at(questionIndex);
        if (question.valid) {
            this.dataService
                .saveQuestion(question.value)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.injector
                            .get(MatSnackBar)
                            .open(`La question ${question.value.text} a été ajoutée à la banque de question avec succès.`, '', {
                                duration: 5000,
                            });
                    },
                    error: (error) => {
                        this.injector.get(MatSnackBar).open(error.error, '', {
                            duration: 5000,
                            panelClass: ['warn-snackbar'],
                        });
                    },
                });
        }
    }

    createChoice(choiceData?: Choice): FormGroup {
        return this.injector.get(FormBuilder).group({
            text: [choiceData?.text || '', Validators.required],
            isCorrect: [choiceData?.isCorrect || false, Validators.required],
        });
    }

    addChoice(questionIndex: number): void {
        const choices = this.getChoices(this.questions.at(questionIndex));
        if (choices.length < VALIDATION.MaxQuestionChoices) {
            choices.push(this.createChoice());
        }
    }

    removeChoice(questionIndex: number, choiceIndex: number): void {
        const choices = this.getChoices(this.questions.at(questionIndex));
        if (choices.length > 2) {
            choices.removeAt(choiceIndex);
        }
    }

    moveChoice(questionIndex: number, choiceIndex: number, direction: 'up' | 'down'): void {
        const choices = this.getChoices(this.questions.at(questionIndex));
        const newIndex = choiceIndex + (direction === 'down' ? SORTING.SecondIsLess : SORTING.FirstIsLess);

        if (newIndex >= 0 && newIndex < choices.length) {
            moveItemInArray(choices.controls, choiceIndex, newIndex);
        }
    }

    createQuiz(formData: Quiz): void {
        this.dataService
            .saveQuiz(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.injector.get(Router).navigate(['/vue-admin']);
                    this.injector.get(MatSnackBar).open(`Le quiz ${formData.title} a été sauvegardé avec succès.`, '', {
                        duration: 5000,
                    });
                },
                error: (error) => {
                    this.injector.get(MatSnackBar).open(error.error, '', {
                        duration: 5000,
                        panelClass: ['warn-snackbar'],
                    });
                },
            });
    }

    modifyQuiz(formData: Quiz, quizId: string): void {
        // TODO : Add a Pipe
        this.dataService.updateQuiz(quizId, formData).subscribe({
            next: () => {
                this.injector.get(Router).navigate(['/vue-admin']);
                this.injector.get(MatSnackBar).open(`Le quiz ${formData.title} a été modifié avec succès.`, '', {
                    duration: 5000,
                });
            },
            error: (error) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.createQuiz(formData);
                } else {
                    this.injector.get(MatSnackBar).open(error.error, '', {
                        duration: 5000,
                        panelClass: ['warn-snackbar'],
                    });
                }
            },
        });
    }

    submitForm(): void {
        if (this.form.valid) {
            const formData = this.form.value;
            const url = this.injector.get(Router).url;
            const urlSections = url.split('/');
            const quizId = urlSections[urlSections.length - 1];

            if (urlSections.includes('modify-quiz')) {
                this.modifyQuiz(formData, quizId);
            } else {
                this.createQuiz(formData);
            }
        }
    }

    cancel(): void {
        this.injector.get(Router).navigate(['/vue-admin']);
    }

    drop(event: CdkDragDrop<string[]>) {
        const formArray = this.form.get('questions') as FormArray;
        moveItemInArray(formArray.controls, event.previousIndex, event.currentIndex);
    }

    getErrorDescription(path: (string | number)[]): string {
        const control = this.form.get(path);

        if (!control) return '';

        if (control.hasError('required')) {
            return 'Ce champ ne peut pas être vide.';
        } else if (control.hasError('invalidChoices')) {
            return 'La question doit contenir au moins une bonne et une mauvaise réponse.';
        } else if (control.hasError('min') && control.errors?.min) {
            return `La valeur minimale est ${control.errors['min'].min}.`;
        } else if (control.hasError('max') && control.errors?.max) {
            return `La valeur maximale est ${control.errors['max'].max}.`;
        } else if (control.hasError('notMultipleOf') && control.errors?.notMultipleOf) {
            return `La valeur doit être un multiple de ${control.errors['notMultipleOf'].multiple}`;
        }

        return '';
    }

    hasCorrectAndIncorrectChoice(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!(control instanceof FormArray)) return null;
            const choices = control.controls;

            const hasCorrectAnswer = choices.some((choice) => choice.value.isCorrect);
            const hasIncorrectAnswer = choices.some((choice) => !choice.value.isCorrect);

            if (hasCorrectAnswer && hasIncorrectAnswer) {
                return null;
            }
            return { invalidChoices: true };
        };
    }

    multipleOf(multiple: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value === null || control.value === '') return null;

            const isMultiple = control.value % multiple === 0;
            return isMultiple ? null : { notMultipleOf: { multiple } };
        };
    }

    questionDirty(questionIndex: number): boolean {
        const choices = this.getChoices(this.questions.at(questionIndex));
        return choices.controls.some((control) => control.dirty);
    }
}
