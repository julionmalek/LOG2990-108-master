import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { DataService } from '@app/services/data.service/data.service';
import { SharedService } from '@app/services/shared.service/shared.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

interface FormData {
    text: string;
    choices: { text: string }[];
    correctAnswers: number[];
    points: number;
}

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent implements OnInit, OnDestroy {
    questionForm: FormGroup;
    readonly maxChoices = 4;
    questionId: string | null = null;
    readonly minPoints = 10;
    readonly maxPoints = 100;

    questions: Question[] = [];
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private injector: Injector,
        private dataService: DataService,
        private sharedService: SharedService,
    ) {}

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    ngOnInit(): void {
        this.dataService
            .fetchQuestions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.body) {
                        this.questions = response.body;
                    }
                },
                error: () => {
                    this.injector.get(MatSnackBar).open('Erreur lors du chargement des questions. Veuillez reessayer plus tard.', '', {
                        duration: 5000,
                    });
                    return;
                },
            });

        this.questionForm = this.injector.get(FormBuilder).group({
            text: ['', Validators.required],
            choices: this.injector.get(FormBuilder).array([this.initChoice(), this.initChoice()], Validators.required),
            correctAnswers: this.injector.get(FormBuilder).array([], Validators.required),
            points: [0, [Validators.required, Validators.min(this.minPoints), this.multipleOfTenValidator(), this.maxValueValidator(this.maxPoints)]],
        });

        this.sharedService.currentQuestion.pipe(takeUntil(this.destroy$)).subscribe((question: Question | null) => {
            if (question) {
                this.loadQuestion(question);
            }
        });

        this.injector
            .get(ActivatedRoute)
            .queryParams.pipe(takeUntil(this.destroy$))
            .subscribe((params) => {
                if (params['newQuestion'] === 'true') {
                    this.resetForm();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    multipleOfTenValidator(): Validators {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = control.value;
            if (value % this.minPoints !== 0) {
                return { notMultipleOfTen: true };
            }
            return null;
        };
    }

    maxValueValidator(maxValue: number): Validators {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = control.value;
            if (value > maxValue) {
                return { exceedsMaxValue: true };
            }
            return null;
        };
    }

    resetForm(): void {
        this.questionForm.reset();
        this.questionId = null;
        const choicesArray = this.questionForm.get('choices') as FormArray;
        choicesArray.clear();
        this.addChoice();
        this.addChoice();
        const correctAnswers = this.questionForm.get('correctAnswers') as FormArray;
        correctAnswers.clear();
        this.questionForm.patchValue({ points: 0 }); // Add this line
    }

    loadQuestion(questionData: Question): void {
        this.questionId = questionData.id ? questionData.id : '';
        this.questionForm.patchValue({
            text: questionData.text,
            points: questionData.points,
        });

        this.setChoices(questionData.choices);

        const correctAnswers = this.questionForm.get('correctAnswers') as FormArray;
        correctAnswers.clear();

        questionData.choices.forEach((choice, index) => {
            if (choice.isCorrect) {
                correctAnswers.push(new FormControl(index));
            }
        });
    }

    setChoices(choices: { text: string; isCorrect: boolean }[]): void {
        const choicesFormArray = this.choices;
        choicesFormArray.clear();

        choices.forEach((choice) => {
            const choiceFormGroup = this.injector.get(FormBuilder).group({
                text: [choice.text, Validators.required],
            });

            choicesFormArray.push(choiceFormGroup);
        });

        choicesFormArray.controls.forEach((control) => {
            control.updateValueAndValidity();
        });
    }

    initChoice(): FormGroup {
        return this.injector.get(FormBuilder).group({
            text: ['', Validators.required],
        });
    }

    addChoice(): void {
        this.choices.push(this.initChoice());
    }
    onCorrectAnswerToggle(index: number, isChecked: boolean): void {
        const correctAnswers = this.questionForm.get('correctAnswers') as FormArray;
        if (isChecked) {
            correctAnswers.push(new FormControl(index));
        } else {
            const idx = correctAnswers.controls.findIndex((x) => x.value === index);
            correctAnswers.removeAt(idx);
        }
    }

    isChoiceCorrect(index: number): boolean {
        const correctAnswers = this.questionForm.get('correctAnswers') as FormArray;
        return correctAnswers.value.includes(index);
    }

    validateCorrectAnswers(control: AbstractControl): { [key: string]: unknown } | null {
        const formGroup = control as FormGroup;
        const correctAnswers = formGroup.get('correctAnswers') as FormArray;

        if (correctAnswers && correctAnswers.length > 0) {
            return null;
        } else {
            return { noCorrectAnswer: true };
        }
    }

    saveForm(): void {
        const choices = this.questionForm.get('choices') as FormArray;
        if (choices.length === 0) {
            this.injector.get(MatSnackBar).open('Veuillez ajouter au moins un choix.', 'Fermer', { duration: 3000 });
            return;
        }

        const correctAnswers = this.questionForm.get('correctAnswers') as FormArray;
        if (correctAnswers.length === 0) {
            this.injector.get(MatSnackBar).open('Veuillez sélectionner au moins une réponse correcte.', 'Fermer', { duration: 3000 });
            return;
        }

        if (this.questionForm.valid) {
            const dialogRef = this.injector.get(MatDialog).open(ConfirmDialogComponent, {
                width: '400px',
                data: {
                    header: 'Confirmer les modifications',
                    content: 'Êtes-vous sûr de vouloir enregistrer ces modifications ?',
                    confirmLabel: 'Oui',
                    cancelLabel: 'Non',
                },
            });

            dialogRef
                .afterClosed()
                .pipe(takeUntil(this.destroy$))
                .subscribe((result) => {
                    if (result) {
                        this.proceedWithSave();
                    }
                });
        } else {
            this.injector.get(MatSnackBar).open('Veuillez remplir correctement tous les champs obligatoires.', 'Fermer', { duration: 3000 });
        }
    }

    resetFormAndRedirect(): void {
        this.resetForm();
        this.injector.get(Router).navigate(['/vue-admin']);
    }

    canAddChoice(): boolean {
        return this.choices.length < this.maxChoices;
    }

    removeChoice(index: number): void {
        if (this.choices.length > 2) {
            this.choices.removeAt(index);

            if (this.questionForm.get('correctAnswer')?.value === index) {
                this.questionForm.get('correctAnswer')?.reset();
            }
        }
    }

    proceedWithSave(): void {
        const formData = this.questionForm.value as FormData;
        const transformedData = this.transformFormData(formData);

        const existingQuestion = this.questions.find((q) => q.text.toLowerCase() === formData.text.toLowerCase());

        if (existingQuestion && (!this.questionId || this.questionId !== existingQuestion.id)) {
            this.injector
                .get(MatSnackBar)
                .open('Une question avec ce titre existe déjà. Veuillez utiliser un titre différent.', 'Fermer', { duration: 3000 });
            return;
        }

        if (this.questionId) {
            this.dataService
                .updateQuestion(this.questionId, transformedData as Question)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.injector.get(MatSnackBar).open('La question a été mise à jour avec succès.', 'Fermer', { duration: 3000 });
                        this.resetFormAndRedirect();
                    },
                    error: () => {
                        this.injector
                            .get(MatSnackBar)
                            .open("Une erreur s'est produite lors de la mise à jour de la question.", 'Fermer', { duration: 3000 });
                    },
                });
        } else {
            this.dataService
                .saveQuestion(transformedData as Question)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.injector.get(MatSnackBar).open('La question a été créée avec succès.', 'Fermer', { duration: 3000 });
                        this.resetFormAndRedirect();
                    },
                    error: () => {
                        this.injector.get(MatSnackBar).open("Une erreur s'est produite. Veuillez réessayer.", 'Fermer', { duration: 3000 });
                    },
                });
        }
    }

    private transformFormData(formData: FormData) {
        const transformedChoices = formData.choices.map((choice, index) => ({
            text: choice.text,
            isCorrect: formData.correctAnswers.includes(index),
        }));

        return {
            type: 'QCM',
            text: formData.text,
            choices: transformedChoices,
            points: formData.points,
        };
    }
}
