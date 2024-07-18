/* eslint-disable no-invalid-this */
// Pour éviter les erreurs de no-invalid-this dans les schema de mongoose. Le this fait référence à l'instance du schéma.
import { VALIDATION } from '@utilities/constants';
import mongoose, { Document, Model } from 'mongoose';

export interface IChoice {
    text: string;
    isCorrect: boolean;
}

export interface IQuestion extends Document {
    type: string;
    text: string;
    points: number;
    choices?: IChoice[];
    lastModification: Date;
}

const choiceSchema = new mongoose.Schema<IChoice>({
    // Mongoose schema needs JS String constructor function instead of TS string type

    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
});

choiceSchema.virtual('id').get(function () {
    // we use _id.toHexString() to transform from _id to id
    // eslint-disable-next-line no-underscore-dangle
    return this._id.toHexString();
});

choiceSchema.set('toJSON', {
    virtuals: true,
});

const arrayLimit = (val: IChoice[]): boolean => {
    return val.length >= VALIDATION.MIN_QUESTION_CHOICES && val.length <= VALIDATION.MAX_QUESTION_CHOICES;
};

export const questionSchema = new mongoose.Schema<IQuestion>({
    // Mongoose schema needs JS String constructor function instead of TS string type
    type: { type: String, required: true, enum: ['QCM', 'QRL'] },
    text: { type: String, required: true },
    choices: {
        type: [choiceSchema],
        required() {
            return this.type === 'QCM';
        },
        validate: [arrayLimit, '{PATH} exceeds the limit of 4'],
    },
    points: {
        type: Number,
        required: true,
        validate: {
            validator: (v: number): boolean =>
                Number.isInteger(v) &&
                v >= VALIDATION.MIN_QUESTION_POINTS &&
                v <= VALIDATION.MAX_QUESTION_POINTS &&
                v % VALIDATION.MIN_QUESTION_POINTS === 0,
            message: (props) => `${props.value} n'est pas valide. Doit être un multiple de 10 situé entre 10 et 100.`,
        },
    },
    lastModification: { type: Date, default: Date.now() },
});

questionSchema.pre('save', function (next) {
    this.lastModification = new Date();
    next();
});

questionSchema.pre('findOneAndUpdate', function () {
    this.set({ lastModification: new Date() });
});

questionSchema.virtual('id').get(function () {
    // we use _id.toHexString() to transform from _id to id
    // eslint-disable-next-line no-underscore-dangle
    return this._id.toHexString();
});

questionSchema.set('toJSON', {
    virtuals: true,
});

export const questionModel: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);

// Récupérer toutes les questions
export const getAllQuestions = () => questionModel.find().sort({ lastModification: -1 });

// Récupérer une question par ID
export const getQuestionById = (id: string) => questionModel.findById(id);

// Ajouter une nouvelle question
export const addQuestion = async (questionData: IQuestion) => {
    const questionExists = await questionModel.findOne({ text: questionData.text });
    if (questionExists) {
        throw new Error('Une question avec ce nom existe déjà. Veuillez choisir un autre nom.');
    }
    return new questionModel(questionData).save();
};

// Mettre à jour une question
export const updateQuestion = (id: string, questionData: IQuestion) => questionModel.findByIdAndUpdate(id, questionData, { new: true });

// Supprimer une question
export const deleteQuestion = (id: string) => questionModel.findByIdAndDelete(id);
