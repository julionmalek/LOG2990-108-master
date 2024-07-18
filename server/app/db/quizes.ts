/* eslint-disable no-invalid-this */
// Pour éviter les erreurs de no-invalid-this dans les schema de mongoose. Le this fait référence à l'instance du schéma.

import { VALIDATION } from '@utilities/constants';
import mongoose, { Document, Model } from 'mongoose';
import { IQuestion, questionSchema } from './questions';

export interface IQuiz extends Document {
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: IQuestion[];
    hidden: boolean;
}

export const quizSchema: mongoose.Schema<IQuiz> = new mongoose.Schema<IQuiz>({
    // Mongoose schema needs JS String constructor function instead of TS string type
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: {
        type: Number,
        validate: {
            // validate that the duration is between 10 and 60 seconds
            validator: (v: number): boolean => Number.isInteger(v) && v >= VALIDATION.MIN_QUESTION_DURATION && v <= VALIDATION.MAX_QUESTION_DURATION,
            message: (props) => `${props.value} n'est pas valide. Doit être un nombre entier situé entre 10 et 60.`,
        },
    },
    lastModification: { type: Date, default: Date.now() },
    questions: { type: [questionSchema] },
    hidden: { type: Boolean, default: false },
});

quizSchema.pre('save', function (next) {
    this.lastModification = new Date();
    next();
});

quizSchema.pre('findOneAndUpdate', function () {
    this.set({ lastModification: new Date() });
});

quizSchema.virtual('id').get(function () {
    // we use _id.toHexString() to transform from _id to id
    // eslint-disable-next-line no-underscore-dangle
    return this._id.toHexString();
});

quizSchema.set('toJSON', {
    virtuals: true,
});

export const quizModel: Model<IQuiz> = mongoose.model<IQuiz>('Quiz', quizSchema);
export const getAllQuizzes = () => quizModel.find();
export const getQuizById = (id: string) => quizModel.findById(id);
export const addQuiz = async (quizData: IQuiz) => {
    const quizExists = await quizModel.findOne({ title: quizData.title });
    if (quizExists) {
        throw new Error('Un quiz avec ce nom existe déjà. Veuillez choisir un autre nom.');
    }
    return new quizModel(quizData).save();
};
export const updateQuiz = (id: string, quizData: IQuiz) => quizModel.findByIdAndUpdate(id, quizData, { new: true });
export const deleteQuiz = (id: string) => quizModel.findByIdAndDelete(id);
