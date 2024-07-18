import { TestBed } from '@angular/core/testing';
import { SharedService } from './shared.service';

describe('SharedService', () => {
    let service: SharedService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SharedService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('get should return an Observable', () => {
        expect(service.currentQuestion).toBeTruthy();
    });

    it('changeQuestion should set the value of the Observable', () => {
        const question = {
            type: 'QCM',
            id: '1',
            text: 'this is a question title',
            answer: 'this is an answer',
            choices: [],
            points: 20,
            showChoices: true,
            lastModification: new Date(),
            quizId: '1',
        };
        service.changeQuestion(question);
        service.currentQuestion.subscribe((data) => {
            expect(data).toEqual(question);
        });
    });
});
